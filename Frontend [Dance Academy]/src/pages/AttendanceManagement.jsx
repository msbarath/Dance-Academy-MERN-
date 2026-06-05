import { useState, useMemo, useCallback, useEffect } from "react";
import { attendanceApi, studentsApi } from "../utils/api";
import { validateDate } from "../utils/validation";
import FormField from "../components/FormField";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

const EMPTY = { studentId: "", date: "", status: "Present" };
const DRAFT_KEY = "attendanceDraft";
const TODAY = new Date().toISOString().split("T")[0];

function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || EMPTY; } catch { return EMPTY; }
}

function AttendanceManagement() {
    const [attendance, setAttendance] = useState([]);
    const [students,   setStudents]   = useState([]);
    const [form,       setForm]       = useState(readDraft);
    const [errors,     setErrors]     = useState({});
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [apiErr,     setApiErr]     = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [editing,    setEditing]    = useState(null);

    useEffect(() => {
        Promise.all([attendanceApi.getAll(), studentsApi.getAll()])
            .then(([ar, sr]) => { setAttendance(ar.data.data); setStudents(sr.data.data); })
            .catch(() => setApiErr("Failed to load data."))
            .finally(() => setLoading(false));
    }, []);

    const validateField = useCallback((name, value) => {
        if (name === "studentId") return value ? "" : "Please select a student.";
        if (name === "date")      return validateDate(value);
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

    function startEdit(record) {
        setEditing(record);
        setForm({ studentId: record.student, date: record.date, status: record.status });
        setErrors({});
        setApiErr("");
    }

    function cancelEdit() {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setApiErr("");
    }

    async function handleMark(e) {
        e.preventDefault();
        const newErrors = {
            studentId: validateField("studentId", form.studentId),
            date:      validateField("date", form.date),
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const r = await attendanceApi.mark({ studentId: form.studentId, date: form.date, status: form.status });
            setAttendance(a => [r.data.data, ...a]);
            setForm(p => ({ ...EMPTY, date: p.date }));
            setErrors({});
            sessionStorage.removeItem(DRAFT_KEY);
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to mark attendance.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await attendanceApi.update(editing._id, { status: form.status });
            setAttendance(a => a.map(x => x._id === editing._id ? r.data.data : x));
            cancelEdit();
        } catch {
            setApiErr("Failed to update attendance.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this attendance record?")) return;
        try {
            await attendanceApi.remove(id);
            setAttendance(a => a.filter(x => x._id !== id));
        } catch {
            setApiErr("Failed to delete record.");
        }
    }

    const displayed    = useMemo(() => filterDate ? attendance.filter(a => a.date === filterDate) : attendance, [attendance, filterDate]);
    const presentCount = useMemo(() => attendance.filter(a => a.status === "Present").length, [attendance]);
    const absentCount  = useMemo(() => attendance.filter(a => a.status === "Absent").length,  [attendance]);
    const todayPresent = useMemo(() => attendance.filter(a => a.date === TODAY && a.status === "Present").length, [attendance]);
    const todayAbsent  = useMemo(() => attendance.filter(a => a.date === TODAY && a.status === "Absent").length,  [attendance]);

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Attendance Management</h1>
                <p>Mark and track student attendance records.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Records"  value={attendance.length} />
                <StatCard label="All Present"    value={presentCount}      variant="success" />
                <StatCard label="All Absent"     value={absentCount}       variant="danger" />
                <StatCard label="Present Today"  value={todayPresent}      variant="success" />
                <StatCard label="Absent Today"   value={todayAbsent}       variant="danger" />
            </div>

            <div className="panel-form-box">
                <h2>{editing ? "Edit Attendance" : "Mark Attendance"}</h2>
                {apiErr && <div className="panel-error">{apiErr}</div>}
                {students.length === 0 && !loading ? (
                    <p className="panel-empty">No students enrolled yet. Add students first.</p>
                ) : (
                    <form className="panel-form" onSubmit={editing ? handleUpdate : handleMark} noValidate>
                        <div className="panel-form-row">
                            {!editing && (
                                <>
                                    <FormField label="Student" error={errors.studentId}>
                                        <select name="studentId" value={form.studentId} onChange={handleChange} onBlur={handleBlur} className={errors.studentId ? "input-error" : ""}>
                                            <option value="">Select student</option>
                                            {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.course}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Date" error={errors.date}>
                                        <input type="date" name="date" value={form.date} onChange={handleChange} onBlur={handleBlur} className={errors.date ? "input-error" : ""} />
                                    </FormField>
                                </>
                            )}
                            {editing && (
                                <div style={{ padding: "8px 0", fontWeight: 600 }}>
                                    {editing.studentName} &mdash; {editing.date}
                                </div>
                            )}
                            <FormField label="Status">
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option>Present</option>
                                    <option>Absent</option>
                                </select>
                            </FormField>
                        </div>
                        <div className="panel-form-actions">
                            <button type="submit" className="panel-btn" disabled={saving}>
                                {saving ? (editing ? "Saving..." : "Marking...") : (editing ? "Save Changes" : "Mark Attendance")}
                            </button>
                            {editing && <button type="button" className="panel-btn panel-btn-ghost" onClick={cancelEdit}>Cancel</button>}
                        </div>
                    </form>
                )}
            </div>

            <div className="panel-table-box">
                <div className="panel-table-header">
                    <h2>Attendance Records <span className="panel-count">{displayed.length}</span></h2>
                    <div className="panel-filter">
                        <label>Filter by date:</label>
                        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        {filterDate && <button className="panel-clear-btn" onClick={() => setFilterDate("")}>Clear</button>}
                    </div>
                </div>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : displayed.length === 0 ? (
                    <p className="panel-empty">{filterDate ? "No records for this date." : "No attendance records yet."}</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Student</th><th>Course</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {displayed.map((a, i) => (
                                <tr key={a._id}>
                                    <td>{i + 1}</td>
                                    <td>{a.studentName}</td>
                                    <td>{a.course}</td>
                                    <td>{a.date}</td>
                                    <td><span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                                    <td className="panel-actions">
                                        <button className="panel-edit" onClick={() => startEdit(a)}>Edit</button>
                                        <button className="panel-delete" onClick={() => handleDelete(a._id)}>Delete</button>
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

export default AttendanceManagement;
