import { useState, useEffect, useRef, useCallback } from "react";
import { threadsApi, authApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import "./AdminPanel.css";
import "./ThreadManagement.css";

function ThreadManagement() {
    const { user } = useAuth();
    const [threads,       setThreads]       = useState([]);
    const [users,         setUsers]         = useState([]);
    const [activeThread,  setActiveThread]  = useState(null);
    const [messages,      setMessages]      = useState([]);
    const [newTitle,      setNewTitle]      = useState("");
    const [participants,  setParticipants]  = useState([]);
    const [msgInput,      setMsgInput]      = useState("");
    const [loading,       setLoading]       = useState(true);
    const [msgLoading,    setMsgLoading]    = useState(false);
    const [sending,       setSending]       = useState(false);
    const [creating,      setCreating]      = useState(false);
    const [apiErr,        setApiErr]        = useState("");
    const [titleErr,      setTitleErr]      = useState("");
    const [editingThread, setEditingThread] = useState(null);
    const [editTitle,     setEditTitle]     = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        const fetches = [threadsApi.getAll()];
        if (user?.role === "admin") fetches.push(authApi.getAllUsers());
        Promise.all(fetches)
            .then(([tr, ur]) => {
                setThreads(tr.data.data);
                if (ur) setUsers(ur.data.data);
            })
            .catch(() => setApiErr("Failed to load data."))
            .finally(() => setLoading(false));
    }, [user?.role]);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const openThread = useCallback(async (thread) => {
        setActiveThread(thread);
        setMsgLoading(true);
        setApiErr("");
        try {
            const r = await threadsApi.getMessages(thread._id);
            setMessages(r.data.data);
        } catch {
            setApiErr("Failed to load messages.");
        } finally {
            setMsgLoading(false);
        }
    }, []);

    async function handleCreateThread(e) {
        e.preventDefault();
        if (!newTitle.trim()) { setTitleErr("Thread title is required."); return; }
        setCreating(true);
        try {
            const r = await threadsApi.create({ title: newTitle.trim(), participants });
            setThreads(t => [r.data.data, ...t]);
            setNewTitle("");
            setParticipants([]);
            setTitleErr("");
            openThread(r.data.data);
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to create thread.");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateThread(e) {
        e.preventDefault();
        if (!editTitle.trim()) return;
        try {
            const r = await threadsApi.update(editingThread._id, { title: editTitle.trim() });
            setThreads(t => t.map(x => x._id === editingThread._id ? r.data.data : x));
            if (activeThread?._id === editingThread._id) setActiveThread(r.data.data);
            setEditingThread(null);
            setEditTitle("");
        } catch {
            setApiErr("Failed to update thread.");
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if (!msgInput.trim() || !activeThread) return;
        setSending(true);
        try {
            const r = await threadsApi.sendMessage(activeThread._id, { content: msgInput.trim() });
            setMessages(m => [...m, r.data.data]);
            setMsgInput("");
        } catch {
            setApiErr("Failed to send message.");
        } finally {
            setSending(false);
        }
    }

    async function handleDeleteThread(id) {
        if (!window.confirm("Delete this thread and all its messages?")) return;
        try {
            await threadsApi.remove(id);
            setThreads(t => t.filter(x => x._id !== id));
            if (activeThread?._id === id) { setActiveThread(null); setMessages([]); }
        } catch {
            setApiErr("Failed to delete thread.");
        }
    }

    function toggleParticipant(uid) {
        setParticipants(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid]);
    }

    const otherUsers = users.filter(u => u._id !== user?.id);

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>Threads &amp; Messaging</h1>
                <p>Create threads and communicate with users.</p>
            </div>

            {apiErr && <div className="panel-error">{apiErr}</div>}

            {editingThread && (
                <form className="thread-edit-inline" onSubmit={handleUpdateThread}>
                    <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="New thread title"
                        autoFocus
                    />
                    <button type="submit" className="panel-btn">Save</button>
                    <button type="button" className="panel-btn panel-btn-ghost" onClick={() => { setEditingThread(null); setEditTitle(""); }}>Cancel</button>
                </form>
            )}

            <div className="thread-layout">
                <div className="thread-sidebar">
                    <form className="thread-create-form" onSubmit={handleCreateThread} noValidate>
                        <h3>New Thread</h3>
                        <FormField label="Title" error={titleErr}>
                            <input
                                placeholder="Thread title"
                                value={newTitle}
                                onChange={e => { setNewTitle(e.target.value); setTitleErr(""); }}
                                className={titleErr ? "input-error" : ""}
                            />
                        </FormField>
                        {otherUsers.length > 0 && (
                            <div className="thread-participants">
                                <label>Add Participants</label>
                                {otherUsers.map(u => (
                                    <label key={u._id} className="thread-participant-item">
                                        <input
                                            type="checkbox"
                                            checked={participants.includes(u._id)}
                                            onChange={() => toggleParticipant(u._id)}
                                        />
                                        {u.firstname} {u.lastname}
                                    </label>
                                ))}
                            </div>
                        )}
                        <button type="submit" className="panel-btn" disabled={creating}>
                            {creating ? "Creating..." : "Create Thread"}
                        </button>
                    </form>

                    <div className="thread-list">
                        <h3>Threads <span className="panel-count">{threads.length}</span></h3>
                        {loading ? (
                            <p className="panel-empty">Loading...</p>
                        ) : threads.length === 0 ? (
                            <p className="panel-empty">No threads yet.</p>
                        ) : (
                            threads.map(t => (
                                <div
                                    key={t._id}
                                    className={`thread-item${activeThread?._id === t._id ? " active" : ""}`}
                                    onClick={() => openThread(t)}
                                >
                                    <div className="thread-item-title">{t.title}</div>
                                    <div className="thread-item-meta">
                                        {t.creator?.firstname} &bull; {new Date(t.updatedAt).toLocaleDateString()}
                                    </div>
                                    {t.creator?._id === user?.id && (
                                        <>
                                            <button
                                                className="thread-edit-btn"
                                                onClick={e => { e.stopPropagation(); setEditingThread(t); setEditTitle(t.title); }}
                                            >
                                                &#9998;
                                            </button>
                                            <button
                                                className="thread-delete-btn"
                                                onClick={e => { e.stopPropagation(); handleDeleteThread(t._id); }}
                                            >
                                                &times;
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="thread-chat">
                    {!activeThread ? (
                        <div className="thread-chat-empty">Select a thread to view messages</div>
                    ) : (
                        <>
                            <div className="thread-chat-header">
                                <strong>{activeThread.title}</strong>
                                <span className="thread-chat-meta">
                                    Created by {activeThread.creator?.firstname} {activeThread.creator?.lastname}
                                </span>
                            </div>
                            <div className="thread-messages">
                                {msgLoading ? (
                                    <p className="panel-empty">Loading messages...</p>
                                ) : messages.length === 0 ? (
                                    <p className="panel-empty">No messages yet. Start the conversation!</p>
                                ) : (
                                    messages.map(m => {
                                        const isMe = m.sender?._id === user?.id || m.sender?.email === user?.email;
                                        return (
                                            <div key={m._id} className={`message-bubble${isMe ? " me" : ""}`}>
                                                {!isMe && (
                                                    <div className="message-sender">
                                                        {m.sender?.firstname} {m.sender?.lastname}
                                                    </div>
                                                )}
                                                <div className="message-content">{m.content}</div>
                                                <div className="message-time">
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>
                            <form className="thread-msg-form" onSubmit={handleSendMessage}>
                                <input
                                    placeholder="Type a message..."
                                    value={msgInput}
                                    onChange={e => setMsgInput(e.target.value)}
                                    disabled={sending}
                                />
                                <button type="submit" className="panel-btn" disabled={sending || !msgInput.trim()}>
                                    {sending ? "..." : "Send"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ThreadManagement;
