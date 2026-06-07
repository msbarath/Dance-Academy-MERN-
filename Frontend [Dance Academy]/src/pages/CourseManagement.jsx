import { useState, useCallback, useEffect } from "react";
import { coursesApi } from "../utils/api";
import { validate, hasErrors } from "../utils/validation";
import { invalidateStore } from "../hooks/useStore";
import FormField from "../components/FormField";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

const EMPTY = { name: "", instructor: "", schedule: "", fee: "" };
const DRAFT_KEY = "courseDraft";

function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || EMPTY; } catch { return EMPTY; }
}

function CourseManagement() {
    const [courses,  setCourses]  = useState([]);
    const [form,     setForm]     = useState(readDraft);
    const [errors,   setErrors]   = useState({});
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [apiErr,   setApiErr]   = useState("");
    const [editing,  setEditing]  = useState(null);

    useEffect(() => {
        coursesApi.getAll()
            .then(r => setCourses(r.data.data))
            .catch(() => setApiErr("Failed to load courses."))
            .finally(() => setLoading(false));
    }, []);

    const validateField = useCallback((name, value) => {
        const map = { name: "courseName", instructor: "instructor", schedule: "schedule", fee: "fee" };
        return validate(map[name] || name, value);
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

    function startEdit(course) {
        setEditing(course);
        setForm({ name: course.name, instructor: course.instructor, schedule: course.schedule, fee: String(course.fee) });
        setErrors({});
        setApiErr("");
    }

    function cancelEdit() {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setApiErr("");
    }

    function validate4() {
        return {
            name:       validateField("name",       form.name),
            instructor: validateField("instructor", form.instructor),
            schedule:   validateField("schedule",   form.schedule),
            fee:        validateField("fee",        form.fee),
        };
    }

    async function handleAdd(e) {
        e.preventDefault();
        const newErrors = validate4();
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSaving(true);
        try {
            const r = await coursesApi.create({ ...form, fee: Number(form.fee) });
            setCourses(c => [r.data.data, ...c]);
            setForm(EMPTY);
            setErrors({});
            sessionStorage.removeItem(DRAFT_KEY);
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to add course.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        const newErrors = validate4();
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSaving(true);
        try {
            const r = await coursesApi.update(editing._id, { ...form, fee: Number(form.fee) });
            setCourses(c => c.map(x => x._id === editing._id ? r.data.data : x));
            cancelEdit();
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to update course.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        const course = courses.find(x => x._id === id);
        if (!window.confirm(`Delete "${course?.name}"? This will also remove any orphaned attendance and fee records for this course.`)) return;
        try {
            await coursesApi.remove(id);
            setCourses(c => c.filter(x => x._id !== id));
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to delete course.");
        }
    }

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Course Management</h1>
                <p>Add and manage dance courses offered at the academy.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Courses" value={courses.length} />
            </div>

            <div className="panel-form-box">
                <h2>{editing ? "Edit Course" : "Add New Course"}</h2>
                {apiErr && <div className="panel-error">{apiErr}</div>}
                <form className="panel-form" onSubmit={editing ? handleUpdate : handleAdd} noValidate>
                    <div className="panel-form-row">
                        <FormField label="Course Name" error={errors.name}>
                            <input name="name" placeholder="e.g. Hip Hop Basics" value={form.name} onChange={handleChange} onBlur={handleBlur} className={errors.name ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Instructor" error={errors.instructor}>
                            <input name="instructor" placeholder="Instructor name" value={form.instructor} onChange={handleChange} onBlur={handleBlur} className={errors.instructor ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Schedule" error={errors.schedule}>
                            <input name="schedule" placeholder="e.g. Mon & Wed 5–6 PM" value={form.schedule} onChange={handleChange} onBlur={handleBlur} className={errors.schedule ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Fee (&#8377;)" error={errors.fee}>
                            <input name="fee" placeholder="e.g. 1500" value={form.fee} onChange={handleChange} onBlur={handleBlur} className={errors.fee ? "input-error" : ""} />
                        </FormField>
                    </div>
                    <div className="panel-form-actions">
                        <button type="submit" className="panel-btn" disabled={saving}>
                            {saving ? (editing ? "Saving..." : "Adding...") : (editing ? "Save Changes" : "Add Course")}
                        </button>
                        {editing && <button type="button" className="panel-btn panel-btn-ghost" onClick={cancelEdit}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="panel-table-box">
                <h2>All Courses <span className="panel-count">{courses.length}</span></h2>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : courses.length === 0 ? (
                    <p className="panel-empty">No courses added yet.</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Course Name</th><th>Instructor</th><th>Schedule</th><th>Fee (&#8377;)</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {courses.map((c, i) => (
                                <tr key={c._id}>
                                    <td>{i + 1}</td>
                                    <td>{c.name}</td>
                                    <td>{c.instructor}</td>
                                    <td>{c.schedule}</td>
                                    <td>&#8377;{c.fee}</td>
                                    <td className="panel-actions">
                                        <button className="panel-edit" onClick={() => startEdit(c)}>Edit</button>
                                        <button className="panel-delete" onClick={() => handleDelete(c._id)}>Delete</button>
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

export default CourseManagement;
