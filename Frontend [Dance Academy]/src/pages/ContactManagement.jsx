import { useState, useEffect } from "react";
import { contactApi } from "../utils/api";
import StatCard from "../components/StatCard";
import "./AdminPanel.css";

function ContactManagement() {
    const [messages, setMessages] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [apiErr,   setApiErr]   = useState("");

    useEffect(() => {
        contactApi.getAll()
            .then(r => setMessages(r.data.data))
            .catch(() => setApiErr("Failed to load messages."))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(id) {
        if (!window.confirm("Delete this message?")) return;
        try {
            await contactApi.remove(id);
            setMessages(m => m.filter(x => x._id !== id));
        } catch {
            setApiErr("Failed to delete message.");
        }
    }

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Contact Messages</h1>
                <p>View and manage messages received from the contact form.</p>
            </div>

            <div className="panel-stats-row">
                <StatCard label="Total Messages" value={messages.length} color="#8b5cf6" />
            </div>

            {apiErr && <div className="panel-error">{apiErr}</div>}

            <div className="panel-table-box">
                <h2>All Messages <span className="panel-count">{messages.length}</span></h2>
                {loading ? (
                    <p className="panel-empty">Loading...</p>
                ) : messages.length === 0 ? (
                    <p className="panel-empty">No messages received yet.</p>
                ) : (
                    <table className="panel-table">
                        <thead>
                            <tr><th>#</th><th>Name</th><th>Email</th><th>Message</th><th>Received</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {messages.map((m, i) => (
                                <tr key={m._id}>
                                    <td>{i + 1}</td>
                                    <td>{m.name}</td>
                                    <td>{m.email}</td>
                                    <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{m.message}</td>
                                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                    <td><button className="panel-delete" onClick={() => handleDelete(m._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ContactManagement;
