import { useState, useMemo, useCallback, useEffect } from "react";
import { eventsApi } from "../utils/api";
import { validate, validateDate } from "../utils/validation";
import { invalidateStore } from "../hooks/useStore";
import FormField from "../components/FormField";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

const EMPTY = { title: "", type: "Event", date: "", venue: "", description: "" };
const DRAFT_KEY = "eventDraft";
const TODAY = new Date(new Date().toDateString());
const EVENT_TYPES = ["Event", "Competition", "Workshop", "Recital"];

function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || EMPTY; } catch { return EMPTY; }
}

function EventManagement() {
    const [events,     setEvents]     = useState([]);
    const [form,       setForm]       = useState(readDraft);
    const [errors,     setErrors]     = useState({});
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [apiErr,     setApiErr]     = useState("");
    const [filterType, setFilterType] = useState("");
    const [editing,    setEditing]    = useState(null);

    useEffect(() => {
        eventsApi.getAll()
            .then(r => setEvents(r.data.data))
            .catch(() => setApiErr("Failed to load events."))
            .finally(() => setLoading(false));
    }, []);

    const validateField = useCallback((name, value) => {
        if (name === "title")       return validate("title", value);
        if (name === "venue")       return validate("venue", value);
        if (name === "date")        return validateDate(value, false);
        if (name === "description") return validate("description", value, false);
        return "";
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);
        setApiErr("");
        if (!editing) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    }

    function handleBlur(e) {
        setErrors(p => ({ ...p, [e.target.name]: validateField(e.target.name, e.target.value) }));
    }

    function startEdit(event) {
        setEditing(event);
        setForm({ title: event.title, type: event.type, date: event.date, venue: event.venue, description: event.description || "" });
        setErrors({});
        setApiErr("");
    }

    function cancelEdit() {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setApiErr("");
    }

    function validateForm() {
        return {
            title:       validateField("title",       form.title),
            venue:       validateField("venue",       form.venue),
            date:        validateField("date",        form.date),
            description: validateField("description", form.description),
        };
    }

    async function handleAdd(e) {
        e.preventDefault();
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const r = await eventsApi.create(form);
            setEvents(ev => [...ev, r.data.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
            setForm(EMPTY);
            setErrors({});
            sessionStorage.removeItem(DRAFT_KEY);
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to add event.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const r = await eventsApi.update(editing._id, form);
            setEvents(ev => ev.map(x => x._id === editing._id ? r.data.data : x).sort((a, b) => new Date(a.date) - new Date(b.date)));
            cancelEdit();
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to update event.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this event?")) return;
        try {
            await eventsApi.remove(id);
            setEvents(ev => ev.filter(e => e._id !== id));
            invalidateStore();
        } catch {
            setApiErr("Failed to delete event.");
        }
    }

    const upcoming  = useMemo(() => events.filter(e => new Date(e.date) >= TODAY).length, [events]);
    const past      = useMemo(() => events.filter(e => new Date(e.date) <  TODAY).length, [events]);
    const displayed = useMemo(() => filterType ? events.filter(e => e.type === filterType) : events, [events, filterType]);

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Event &amp; Competition Management</h1>
                <p>Organize and track dance events, recitals, and competitions.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Events" value={events.length} />
                <StatCard label="Upcoming"     value={upcoming}      variant="success" />
                <StatCard label="Completed"    value={past}          color="#888888" />
            </div>

            <div className="panel-form-box">
                <h2>{editing ? "Edit Event" : "Add New Event"}</h2>
                {apiErr && <div className="panel-error">{apiErr}</div>}
                <form className="panel-form" onSubmit={editing ? handleUpdate : handleAdd} noValidate>
                    <div className="panel-form-row">
                        <FormField label="Event Title" error={errors.title}>
                            <input name="title" placeholder="e.g. Annual Dance Recital" value={form.title} onChange={handleChange} onBlur={handleBlur} className={errors.title ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Type">
                            <select name="type" value={form.type} onChange={handleChange}>
                                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Date" error={errors.date}>
                            <input type="date" name="date" value={form.date} onChange={handleChange} onBlur={handleBlur} className={errors.date ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Venue" error={errors.venue}>
                            <input name="venue" placeholder="Venue / location" value={form.venue} onChange={handleChange} onBlur={handleBlur} className={errors.venue ? "input-error" : ""} />
                        </FormField>
                    </div>
                    <FormField label="Description (optional)" error={errors.description}>
                        <input name="description" placeholder="Brief description (max 300 chars)" value={form.description} onChange={handleChange} onBlur={handleBlur} className={errors.description ? "input-error" : ""} style={{ marginBottom: "16px" }} />
                    </FormField>
                    <div className="panel-form-actions">
                        <button type="submit" className="panel-btn" disabled={saving}>
                            {saving ? (editing ? "Saving..." : "Adding...") : (editing ? "Save Changes" : "Add Event")}
                        </button>
                        {editing && <button type="button" className="panel-btn panel-btn-ghost" onClick={cancelEdit}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="panel-table-box">
                <div className="panel-table-header">
                    <h2>All Events <span className="panel-count">{displayed.length}</span></h2>
                    <div className="panel-filter">
                        <label>Filter by type:</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All</option>
                            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        {filterType && <button className="panel-clear-btn" onClick={() => setFilterType("")}>Clear</button>}
                    </div>
                </div>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : displayed.length === 0 ? (
                    <p className="panel-empty">{filterType ? `No ${filterType.toLowerCase()}s added yet.` : "No events added yet."}</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Title</th><th>Type</th><th>Date</th><th>Venue</th><th>Description</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {displayed.map((ev, i) => (
                                <tr key={ev._id}>
                                    <td>{i + 1}</td>
                                    <td>{ev.title}</td>
                                    <td><span className="status-badge present">{ev.type}</span></td>
                                    <td>{ev.date}</td>
                                    <td>{ev.venue}</td>
                                    <td>{ev.description || "—"}</td>
                                    <td className="panel-actions">
                                        <button className="panel-edit" onClick={() => startEdit(ev)}>Edit</button>
                                        <button className="panel-delete" onClick={() => handleDelete(ev._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default EventManagement;
