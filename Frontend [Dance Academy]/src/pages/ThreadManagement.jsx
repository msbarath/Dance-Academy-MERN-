import { useState, useEffect, useRef, useCallback } from "react";
import { threadsApi, authApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import "./AdminPanel.css";
import "./ThreadManagement.css";

const PAGE_SIZE = 20;

function ThreadManagement() {
    const { user } = useAuth();

    const [threads,       setThreads]       = useState([]);
    const [users,         setUsers]         = useState([]);
    const [activeThread,  setActiveThread]  = useState(null);
    const [messages,      setMessages]      = useState([]);

    // create thread
    const [newTitle,     setNewTitle]     = useState("");
    const [participants, setParticipants] = useState([]);
    const [titleErr,     setTitleErr]     = useState("");
    const [creating,     setCreating]     = useState(false);

    // edit thread
    const [editingThread, setEditingThread] = useState(null);
    const [editTitle,     setEditTitle]     = useState("");

    // messaging
    const [msgInput,  setMsgInput]  = useState("");
    const [sending,   setSending]   = useState(false);

    // edit message
    const [editingMsg,     setEditingMsg]     = useState(null);
    const [editMsgContent, setEditMsgContent] = useState("");

    // search / pagination
    const [search,     setSearch]     = useState("");
    const [threadPage, setThreadPage] = useState(1);
    const [threadTotal, setThreadTotal] = useState(0);
    const [msgPage,    setMsgPage]    = useState(1);
    const [msgTotal,   setMsgTotal]   = useState(0);

    // loading / error
    const [loading,    setLoading]    = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [apiErr,     setApiErr]     = useState("");

    const bottomRef = useRef(null);

    // ── load threads ──────────────────────────────────────────────────────────

    const loadThreads = useCallback(async (page = 1, q = "") => {
        setLoading(true);
        setApiErr("");
        try {
            const params = { page, limit: PAGE_SIZE };
            if (q.trim()) params.search = q.trim();

            const [tr, ur] = await Promise.all([
                threadsApi.getAll(params),
                user?.role === "admin"
                    ? authApi.getAllUsers().catch(() => ({ data: { data: [] } }))
                    : Promise.resolve({ data: { data: [] } }),
            ]);

            setThreads(tr.data.data);
            setThreadTotal(tr.data.total ?? tr.data.data.length);
            setUsers(ur.data.data);
            setThreadPage(page);
        } catch {
            setApiErr("Failed to load threads.");
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => { loadThreads(1, ""); }, [loadThreads]);

    // ── load messages ─────────────────────────────────────────────────────────

    const loadMessages = useCallback(async (thread, page = 1) => {
        setMsgLoading(true);
        setApiErr("");
        try {
            const r = await threadsApi.getMessages(thread._id, { page, limit: PAGE_SIZE });
            setMessages(r.data.data);
            setMsgTotal(r.data.total ?? r.data.data.length);
            setMsgPage(page);
        } catch {
            setApiErr("Failed to load messages.");
        } finally {
            setMsgLoading(false);
        }
    }, []);

    const openThread = useCallback(async (thread) => {
        setActiveThread(thread);
        setEditingThread(null);
        setEditTitle("");
        setEditingMsg(null);
        setEditMsgContent("");
        setMsgInput("");
        await loadMessages(thread, 1);
    }, [loadMessages]);

    useEffect(() => {
        if (messages.length > 0 && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // ── search ────────────────────────────────────────────────────────────────

    function handleSearch(e) {
        e.preventDefault();
        loadThreads(1, search);
    }

    // ── Thread CRUD ───────────────────────────────────────────────────────────

    async function handleCreateThread(e) {
        e.preventDefault();
        if (!newTitle.trim()) { setTitleErr("Thread title is required."); return; }
        setCreating(true);
        setApiErr("");
        try {
            const r = await threadsApi.create({ title: newTitle.trim(), participants });
            setNewTitle("");
            setParticipants([]);
            setTitleErr("");
            await loadThreads(1, search);
            await openThread(r.data.data);
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to create thread.");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateThread(e) {
        e.preventDefault();
        if (!editTitle.trim()) return;
        setApiErr("");
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

    async function handleDeleteThread(id) {
        if (!window.confirm("Delete this thread and all its messages?")) return;
        setApiErr("");
        try {
            await threadsApi.remove(id);
            setThreads(t => t.filter(x => x._id !== id));
            setThreadTotal(n => n - 1);
            if (activeThread?._id === id) { setActiveThread(null); setMessages([]); }
        } catch {
            setApiErr("Failed to delete thread.");
        }
    }

    // ── Message CRUD ──────────────────────────────────────────────────────────

    async function handleSendMessage(e) {
        e.preventDefault();
        if (!msgInput.trim() || !activeThread) return;
        if (msgInput.trim().length > 1000) { setApiErr("Message cannot exceed 1000 characters."); return; }
        setSending(true);
        setApiErr("");
        try {
            const r = await threadsApi.sendMessage(activeThread._id, { content: msgInput.trim() });
            setMessages(m => [...m, r.data.data]);
            setMsgTotal(n => n + 1);
            setMsgInput("");
        } catch {
            setApiErr("Failed to send message.");
        } finally {
            setSending(false);
        }
    }

    async function handleUpdateMessage(e) {
        e.preventDefault();
        if (!editMsgContent.trim()) return;
        setApiErr("");
        try {
            const r = await threadsApi.updateMessage(activeThread._id, editingMsg._id, { content: editMsgContent.trim() });
            setMessages(m => m.map(x => x._id === editingMsg._id ? r.data.data : x));
            setEditingMsg(null);
            setEditMsgContent("");
        } catch {
            setApiErr("Failed to update message.");
        }
    }

    async function handleDeleteMessage(msgId) {
        if (!window.confirm("Delete this message?")) return;
        setApiErr("");
        try {
            await threadsApi.deleteMessage(activeThread._id, msgId);
            setMessages(m => m.filter(x => x._id !== msgId));
            setMsgTotal(n => n - 1);
        } catch {
            setApiErr("Failed to delete message.");
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    function toggleParticipant(uid) {
        setParticipants(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid]);
    }

    function isMe(sender) {
        return String(sender?._id) === String(user?.id) || sender?.email === user?.email;
    }

    function canEditThread(t) {
        return String(t.creator?._id) === String(user?.id) || user?.role === "admin";
    }

    function canEditMessage(m) {
        return String(m.sender?._id) === String(user?.id) || user?.role === "admin";
    }

    const otherUsers     = users.filter(u => String(u._id) !== String(user?.id));
    const threadPages    = Math.ceil(threadTotal / PAGE_SIZE);
    const msgPages       = Math.ceil(msgTotal    / PAGE_SIZE);

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

                    <form className="thread-search-form" onSubmit={handleSearch}>
                        <input
                            placeholder="Search threads..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className="panel-btn">Search</button>
                    </form>

                    <div className="thread-list">
                        <h3>Threads <span className="panel-count">{threadTotal}</span></h3>
                        {loading ? (
                            <p className="panel-empty">Loading...</p>
                        ) : threads.length === 0 ? (
                            <p className="panel-empty">No threads found.</p>
                        ) : (
                            <>
                                {threads.map(t => (
                                    <div
                                        key={t._id}
                                        className={`thread-item${activeThread?._id === t._id ? " active" : ""}`}
                                        onClick={() => openThread(t)}
                                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && openThread(t)}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={activeThread?._id === t._id}
                                    >
                                        <div className="thread-item-title">{t.title}</div>
                                        <div className="thread-item-meta">
                                            {t.creator?.firstname} &bull; {new Date(t.updatedAt).toLocaleDateString()}
                                        </div>
                                        {canEditThread(t) && (
                                            <>
                                                <button
                                                    className="thread-edit-btn"
                                                    aria-label="Edit thread"
                                                    onClick={e => { e.stopPropagation(); setEditingThread(t); setEditTitle(t.title); }}
                                                >
                                                    &#9998;
                                                </button>
                                                <button
                                                    className="thread-delete-btn"
                                                    aria-label="Delete thread"
                                                    onClick={e => { e.stopPropagation(); handleDeleteThread(t._id); }}
                                                >
                                                    &times;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {threadPages > 1 && (
                                    <div className="thread-pagination">
                                        <button
                                            className="panel-btn panel-btn-ghost"
                                            disabled={threadPage <= 1}
                                            onClick={() => loadThreads(threadPage - 1, search)}
                                        >
                                            &laquo;
                                        </button>
                                        <span>{threadPage} / {threadPages}</span>
                                        <button
                                            className="panel-btn panel-btn-ghost"
                                            disabled={threadPage >= threadPages}
                                            onClick={() => loadThreads(threadPage + 1, search)}
                                        >
                                            &raquo;
                                        </button>
                                    </div>
                                )}
                            </>
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
                                        const mine = isMe(m.sender);
                                        return (
                                            <div key={m._id} className={`message-bubble${mine ? " me" : ""}`}>
                                                {!mine && (
                                                    <div className="message-sender">
                                                        {m.sender?.firstname} {m.sender?.lastname}
                                                    </div>
                                                )}
                                                {editingMsg?._id === m._id ? (
                                                    <form className="message-edit-form" onSubmit={handleUpdateMessage}>
                                                        <input
                                                            value={editMsgContent}
                                                            onChange={e => setEditMsgContent(e.target.value)}
                                                            autoFocus
                                                            maxLength={1000}
                                                        />
                                                        <button type="submit" className="panel-btn">Save</button>
                                                        <button type="button" className="panel-btn panel-btn-ghost" onClick={() => { setEditingMsg(null); setEditMsgContent(""); }}>Cancel</button>
                                                    </form>
                                                ) : (
                                                    <div className="message-content">
                                                        {m.content}
                                                        {m.edited && <span className="message-edited"> (edited)</span>}
                                                    </div>
                                                )}
                                                <div className="message-time">
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    {canEditMessage(m) && editingMsg?._id !== m._id && (
                                                        <span className="message-actions">
                                                            <button
                                                                className="msg-action-btn"
                                                                aria-label="Edit message"
                                                                onClick={() => { setEditingMsg(m); setEditMsgContent(m.content); }}
                                                            >
                                                                &#9998;
                                                            </button>
                                                            <button
                                                                className="msg-action-btn msg-delete-btn"
                                                                aria-label="Delete message"
                                                                onClick={() => handleDeleteMessage(m._id)}
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {msgPages > 1 && (
                                <div className="thread-pagination msg-pagination">
                                    <button
                                        className="panel-btn panel-btn-ghost"
                                        disabled={msgPage <= 1}
                                        onClick={() => loadMessages(activeThread, msgPage - 1)}
                                    >
                                        &laquo; Older
                                    </button>
                                    <span>{msgPage} / {msgPages}</span>
                                    <button
                                        className="panel-btn panel-btn-ghost"
                                        disabled={msgPage >= msgPages}
                                        onClick={() => loadMessages(activeThread, msgPage + 1)}
                                    >
                                        Newer &raquo;
                                    </button>
                                </div>
                            )}

                            <form className="thread-msg-form" onSubmit={handleSendMessage}>
                                <input
                                    placeholder="Type a message..."
                                    value={msgInput}
                                    onChange={e => setMsgInput(e.target.value)}
                                    disabled={sending}
                                    maxLength={1000}
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
