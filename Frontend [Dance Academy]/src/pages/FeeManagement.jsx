import { useState, useMemo, useCallback, useEffect } from "react";
import { feesApi, studentsApi } from "../utils/api";
import { validate } from "../utils/validation";
import FormField from "../components/FormField";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

const EMPTY = { studentId: "", amount: "", month: "", status: "Paid" };
const DRAFT_KEY = "feeDraft";

function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || EMPTY; } catch { return EMPTY; }
}

function FeeManagement() {
    const [fees,        setFees]        = useState([]);
    const [students,    setStudents]    = useState([]);
    const [form,        setForm]        = useState(readDraft);
    const [errors,      setErrors]      = useState({});
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [apiErr,      setApiErr]      = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [editing,     setEditing]     = useState(null);

    useEffect(() => {
        Promise.all([feesApi.getAll(), studentsApi.getAll()])
            .then(([fr, sr]) => { setFees(fr.data.data); setStudents(sr.data.data); })
            .catch(() => setApiErr("Failed to load data."))
            .finally(() => setLoading(false));
    }, []);

    const validateField = useCallback((name, value) => {
        if (name === "studentId") return value ? "" : "Please select a student.";
        if (name === "amount")    return validate("amount", value);
        if (name === "month")     return value ? "" : "Please select a month.";
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

    function startEdit(fee) {
        setEditing(fee);
        setForm({ studentId: "", amount: String(fee.amount), month: fee.month, status: fee.status });
        setErrors({});
        setApiErr("");
    }

    function cancelEdit() {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setApiErr("");
    }

    async function handleAdd(e) {
        e.preventDefault();
        const newErrors = {
            studentId: validateField("studentId", form.studentId),
            amount:    validateField("amount",    form.amount),
            month:     validateField("month",     form.month),
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const r = await feesApi.record({ ...form, amount: Number(form.amount) });
            setFees(f => [r.data.data, ...f]);
            setForm(EMPTY);
            setErrors({});
            sessionStorage.removeItem(DRAFT_KEY);
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to record payment.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        const newErrors = { amount: validateField("amount", form.amount) };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const r = await feesApi.update(editing._id, { amount: Number(form.amount), status: form.status });
            setFees(f => f.map(x => x._id === editing._id ? r.data.data : x));
            cancelEdit();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to update payment.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this payment record?")) return;
        try {
            await feesApi.remove(id);
            setFees(f => f.filter(x => x._id !== id));
        } catch {
            setApiErr("Failed to delete record.");
        }
    }

    const displayed      = useMemo(() => filterMonth ? fees.filter(f => f.month === filterMonth) : fees, [fees, filterMonth]);
    const totalCollected = useMemo(() => {
        let total = 0;
        for (const f of fees) { if (f.status === "Paid") total += Number(f.amount || 0); }
        return total;
    }, [fees]);
    const totalPending   = useMemo(() => {
        let total = 0;
        for (const f of fees) { if (f.status === "Pending") total += Number(f.amount || 0); }
        return total;
    }, [fees]);

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Fee / Payment Management</h1>
                <p>Record and track student fee payments.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Records"      value={fees.length} />
                <StatCard label="Collected (&#8377;)" value={totalCollected} variant="success" />
                <StatCard label="Pending (&#8377;)"   value={totalPending}   variant="warning" />
            </div>

            <div className="panel-form-box">
                <h2>{editing ? "Edit Payment" : "Record Payment"}</h2>
                {apiErr && <div className="panel-error">{apiErr}</div>}
                {students.length === 0 && !loading ? (
                    <p className="panel-empty">No students enrolled yet. Add students first.</p>
                ) : (
                    <form className="panel-form" onSubmit={editing ? handleUpdate : handleAdd} noValidate>
                        <div className="panel-form-row">
                            {!editing && (
                                <FormField label="Student" error={errors.studentId}>
                                    <select name="studentId" value={form.studentId} onChange={handleChange} onBlur={handleBlur} className={errors.studentId ? "input-error" : ""}>
                                        <option value="">Select student</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.course}</option>)}
                                    </select>
                                </FormField>
                            )}
                            {editing && (
                                <div style={{ padding: "8px 0", fontWeight: 600 }}>
                                    {editing.studentName} &mdash; {editing.course} &mdash; {editing.month}
                                </div>
                            )}
                            <FormField label="Amount (&#8377;)" error={errors.amount}>
                                <input name="amount" placeholder="e.g. 1500" value={form.amount} onChange={handleChange} onBlur={handleBlur} className={errors.amount ? "input-error" : ""} />
                            </FormField>
                            {!editing && (
                            <FormField label="Month" error={errors.month}>
                                <input type="month" name="month" value={form.month} onChange={handleChange} onBlur={handleBlur} className={errors.month ? "input-error" : ""} />
                            </FormField>
                            )}
                            <FormField label="Status">
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option>Paid</option>
                                    <option>Pending</option>
                                </select>
                            </FormField>
                        </div>
                        <div className="panel-form-actions">
                            <button type="submit" className="panel-btn" disabled={saving}>
                                {saving ? (editing ? "Saving..." : "Recording...") : (editing ? "Save Changes" : "Record Payment")}
                            </button>
                            {editing && <button type="button" className="panel-btn panel-btn-ghost" onClick={cancelEdit}>Cancel</button>}
                        </div>
                    </form>
                )}
            </div>

            <div className="panel-table-box">
                <div className="panel-table-header">
                    <h2>Payment Records <span className="panel-count">{displayed.length}</span></h2>
                    <div className="panel-filter">
                        <label>Filter by month:</label>
                        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
                        {filterMonth && <button className="panel-clear-btn" onClick={() => setFilterMonth("")}>Clear</button>}
                    </div>
                </div>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : displayed.length === 0 ? (
                    <p className="panel-empty">{filterMonth ? "No payments for this month." : "No payment records yet."}</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Student</th><th>Course</th><th>Amount</th><th>Month</th><th>Status</th><th>Recorded</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {displayed.map((f, i) => (
                                <tr key={f._id}>
                                    <td>{i + 1}</td>
                                    <td>{f.studentName}</td>
                                    <td>{f.course}</td>
                                    <td>&#8377;{f.amount}</td>
                                    <td>{f.month}</td>
                                    <td><span className={`status-badge ${f.status.toLowerCase()}`}>{f.status}</span></td>
                                    <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                                    <td className="panel-actions">
                                        <button className="panel-edit" onClick={() => startEdit(f)}>Edit</button>
                                        <button className="panel-delete" onClick={() => handleDelete(f._id)}>Delete</button>
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

export default FeeManagement;
