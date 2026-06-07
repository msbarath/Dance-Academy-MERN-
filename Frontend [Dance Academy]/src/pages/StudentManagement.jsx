import { useState, useCallback, useEffect, useMemo } from "react";
import { studentsApi, coursesApi } from "../utils/api";
import { validate, hasErrors } from "../utils/validation";
import { invalidateStore } from "../hooks/useStore";
import FormField from "../components/FormField";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

const EMPTY = { name: "", email: "", phone: "", course: "" };
const DRAFT_KEY = "studentDraft";

function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || EMPTY; } catch { return EMPTY; }
}

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [courses,  setCourses]  = useState([]);
    const [form,     setForm]     = useState(readDraft);
    const [errors,   setErrors]   = useState({});
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [apiErr,   setApiErr]   = useState("");
    const [editing,  setEditing]  = useState(null);

    useEffect(() => {
        Promise.all([studentsApi.getAll(), coursesApi.getAll()])
            .then(([sr, cr]) => {
                setStudents(Array.isArray(sr.data?.data) ? sr.data.data : []);
                setCourses(Array.isArray(cr.data?.data) ? cr.data.data : []);
            })
            .catch(() => setApiErr("Failed to load data."))
            .finally(() => setLoading(false));
    }, []);

    const validateField = useCallback((name, value) => {
        if (name === "course") return value ? "" : "Please select a course.";
        return validate(name, value);
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

    function startEdit(student) {
        setEditing(student);
        setForm({ name: student.name, email: student.email, phone: student.phone, course: student.course });
        setErrors({});
        setApiErr("");
    }

    function cancelEdit() {
        setEditing(null);
        setForm(readDraft());
        setErrors({});
        setApiErr("");
    }

    function validateForm() {
        return {
            name:   validate("name",  form.name),
            email:  validate("email", form.email),
            phone:  validate("phone", form.phone),
            course: form.course ? "" : "Please select a course.",
        };
    }

    async function handleAdd(e) {
        e.preventDefault();
        const newErrors = validateForm();
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSaving(true);
        try {
            const r = await studentsApi.create(form);
            setStudents(s => [r.data.data, ...s]);
            setForm(EMPTY);
            setErrors({});
            sessionStorage.removeItem(DRAFT_KEY);
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to enroll student.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        const newErrors = {
            name:   validate("name",  form.name),
            phone:  validate("phone", form.phone),
            course: form.course ? "" : "Please select a course.",
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSaving(true);
        try {
            const r = await studentsApi.update(editing._id, { name: form.name, phone: form.phone, course: form.course });
            setStudents(s => s.map(x => x._id === editing._id ? r.data.data : x));
            cancelEdit();
            invalidateStore();
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to update student.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Remove this student?")) return;
        try {
            await studentsApi.remove(id);
            setStudents(s => s.filter(x => x._id !== id));
            invalidateStore();
        } catch {
            setApiErr("Failed to delete student.");
        }
    }

    const courseCounts = useMemo(() => courses.reduce((acc, c) => {
        acc[c.name] = students.filter(s => s.course === c.name).length;
        return acc;
    }, {}), [courses, students]);

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Student Management</h1>
                <p>Enroll and manage students across all courses.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Students" value={students.length} />
                <StatCard label="Total Courses"  value={courses.length}  color="#0ea5e9" />
            </div>

            <div className="panel-form-box">
                <h2>{editing ? "Edit Student" : "Enroll New Student"}</h2>
                {apiErr && <div className="panel-error">{apiErr}</div>}
                <form className="panel-form" onSubmit={editing ? handleUpdate : handleAdd} noValidate>
                    <div className="panel-form-row">
                        <FormField label="Full Name" error={errors.name}>
                            <input name="name" placeholder="Student name" value={form.name} onChange={handleChange} onBlur={handleBlur} className={errors.name ? "input-error" : ""} />
                        </FormField>
                        {!editing && (
                            <FormField label="Email" error={errors.email}>
                                <input name="email" type="email" placeholder="Student email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email ? "input-error" : ""} />
                            </FormField>
                        )}
                        <FormField label="Phone" error={errors.phone}>
                            <input name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={errors.phone ? "input-error" : ""} />
                        </FormField>
                        <FormField label="Course" error={errors.course}>
                            <select name="course" value={form.course} onChange={handleChange} onBlur={handleBlur} className={errors.course ? "input-error" : ""}>
                                <option value="">Select course</option>
                                {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="panel-form-actions">
                        <button type="submit" className="panel-btn" disabled={saving}>
                            {saving ? (editing ? "Saving..." : "Enrolling...") : (editing ? "Save Changes" : "Enroll Student")}
                        </button>
                        {editing && <button type="button" className="panel-btn panel-btn-ghost" onClick={cancelEdit}>Cancel</button>}
                    </div>
                </form>
            </div>

            {courses.length > 0 && students.length > 0 && (
                <div className="panel-table-box" style={{ marginBottom: "24px" }}>
                    <h2>Students per Course</h2>
                    <div className="panel-stats-row" style={{ flexWrap: "wrap" }}>
                        {courses.map(c => <StatCard key={c._id} label={c.name} value={courseCounts[c.name] || 0} color="#7b2cff" />)}
                    </div>
                </div>
            )}

            <div className="panel-table-box">
                <h2>All Students <span className="panel-count">{students.length}</span></h2>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : students.length === 0 ? (
                    <p className="panel-empty">No students enrolled yet.</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Enrolled On</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <tr key={s._id}>
                                    <td>{i + 1}</td>
                                    <td>{s.name}</td>
                                    <td>{s.email}</td>
                                    <td>{s.phone}</td>
                                    <td>{s.course}</td>
                                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td className="panel-actions">
                                        <button className="panel-edit" onClick={() => startEdit(s)}>Edit</button>
                                        <button className="panel-delete" onClick={() => handleDelete(s._id)}>Delete</button>
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

export default StudentManagement;
