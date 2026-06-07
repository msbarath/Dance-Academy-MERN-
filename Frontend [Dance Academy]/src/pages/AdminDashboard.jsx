import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, studentsApi, attendanceApi, feesApi, contactApi } from "../utils/api";
import { useStore } from "../hooks/useStore";
import StatCard from "../components/StatCard";
import "./AdminDashboard.css";

const QUICK_LINKS = [
    { to: "/admin/courses",    label: "Course Management",     color: "#7b2cff" },
    { to: "/admin/students",   label: "Student Management",    color: "#0ea5e9" },
    { to: "/admin/attendance", label: "Attendance Management", color: "#10b981" },
    { to: "/admin/fees",       label: "Fee / Payment",         color: "#f59e0b" },
    { to: "/admin/events",     label: "Event & Competition",   color: "#ef4444" },
    { to: "/admin/messages",   label: "Contact Messages",      color: "#8b5cf6" },
    { to: "/admin/threads",    label: "Threads & Messaging",   color: "#06b6d4" },
];

const EMPTY_DATA = {
    users:          [],
    attendance:     [],
    fees:           [],
    messages:       [],
    recentStudents: [],
};

function AdminDashboard() {
    const { user } = useAuth();
    const { courses, studentCount, events } = useStore();
    const [data,    setData]    = useState(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        let failed = 0;
        const safe = (p, fallback) => p.catch(() => { failed++; return fallback; });

        Promise.all([
            safe(authApi.getAllUsers(),          { data: { data: [] } }),
            safe(studentsApi.getAll(),           { data: { data: [] } }),
            safe(attendanceApi.getAll(today),    { data: { data: [] } }),
            safe(feesApi.getAll(),               { data: { data: [] } }),
            safe(contactApi.getAll(),            { data: { data: [] } }),
        ]).then(([u, s, a, f, m]) => {
            setData({
                users:          u.data.data,
                recentStudents: (s.data.data || []).slice(0, 5),
                attendance:     a.data.data,
                fees:           f.data.data,
                messages:       m.data.data,
            });
            if (failed > 0) setLoadErr(`${failed} dashboard section(s) failed to load. Some stats may be incomplete.`);
        }).finally(() => setLoading(false));
    }, []);

    const handleDeleteUser = useCallback(async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await authApi.deleteUser(id);
            setData(d => ({ ...d, users: d.users.filter(u => u._id !== id) }));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user.");
        }
    }, []);

    const stats = useMemo(() => {
        let totalCollected = 0, totalPending = 0, upcomingEvents = 0, presentToday = 0, absentToday = 0;
        const todayDate = new Date(new Date().toDateString());
        for (const f of data.fees) {
            if (f.status === "Paid")         totalCollected += Number(f.amount || 0);
            else if (f.status === "Pending") totalPending   += Number(f.amount || 0);
        }
        for (const e of events) { if (new Date(e.date) >= todayDate) upcomingEvents++; }
        for (const a of data.attendance) {
            if (a.status === "Present") presentToday++;
            else if (a.status === "Absent") absentToday++;
        }
        return { totalCollected, totalPending, upcomingEvents, presentToday, absentToday };
    }, [data, events]);

    const recentMessages = useMemo(() => data.messages.slice(0, 5), [data.messages]);

    if (loading) return <div className="admin-page"><p style={{ padding: "2rem" }}>Loading dashboard...</p></div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>{user ? `Welcome back, ${user.firstname || user.name}` : "Dance Academy Management"}</p>
            </div>

            {loadErr && <div className="panel-error" style={{ margin: "0 0 16px" }}>{loadErr}</div>}

            <div className="admin-stats">
                <StatCard label="Registered Users"  value={data.users.length}              color="#7b2cff" />
                <StatCard label="Active Courses"    value={courses.length}     color="#0ea5e9" />
                <StatCard label="Total Students"    value={studentCount}        color="#10b981" />
                <StatCard label="Present Today"     value={stats.presentToday}              variant="success" />
                <StatCard label="Absent Today"      value={stats.absentToday}               variant="danger" />
                <StatCard label="Fee Collected"     value={`\u20b9${stats.totalCollected}`} color="#f59e0b" />
                <StatCard label="Fee Pending"       value={`\u20b9${stats.totalPending}`}   variant="warning" />
                <StatCard label="Upcoming Events"   value={stats.upcomingEvents}            color="#ef4444" />
                <StatCard label="Total Messages"    value={data.messages.length}            color="#8b5cf6" />
            </div>

            <div className="admin-quick-nav">
                <h2>Quick Actions</h2>
                <div className="quick-nav-grid">
                    {QUICK_LINKS.map(({ to, label, color }) => (
                        <Link to={to} key={to} className="quick-nav-card" style={{ "--accent": color }}>
                            <span>Manage {label}</span>
                            <span className="quick-nav-arrow">&rarr;</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="admin-tables-row">
                <div className="admin-section">
                    <h2>Recent Students</h2>
                    {data.recentStudents.length === 0 ? (
                        <p className="admin-empty">No students enrolled yet.</p>
                    ) : (
                        <table className="admin-table">
                            <thead><tr><th>#</th><th>Name</th><th>Course</th><th>Enrolled</th></tr></thead>
                            <tbody>
                                {data.recentStudents.map((s, i) => (
                                    <tr key={s._id}>
                                        <td>{i + 1}</td>
                                        <td>{s.name}</td>
                                        <td>{s.course}</td>
                                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Link to="/admin/students" className="admin-view-all">View All Students &rarr;</Link>
                </div>

                <div className="admin-section">
                    <h2>Recent Messages</h2>
                    {recentMessages.length === 0 ? (
                        <p className="admin-empty">No messages received yet.</p>
                    ) : (
                        <table className="admin-table">
                            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Date</th></tr></thead>
                            <tbody>
                                {recentMessages.map((m, i) => (
                                    <tr key={m._id}>
                                        <td>{i + 1}</td>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Link to="/admin/messages" className="admin-view-all">View All Messages &rarr;</Link>
                </div>
            </div>

            <div className="admin-section" style={{ marginTop: "24px" }}>
                <h2>Registered Users</h2>
                {data.users.length === 0 ? (
                    <p className="admin-empty">No users registered yet.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {data.users.map((u, i) => (
                                <tr key={u._id}>
                                    <td>{i + 1}</td>
                                    <td>{u.firstname} {u.lastname}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone || "—"}</td>
                                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {u._id !== user?.id && u.role !== "admin" && (
                                            <button className="panel-delete" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                                        )}
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

export default AdminDashboard;
