const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Thread  = require("../Models/ThreadModel");
const Message = require("../Models/MessageModel");

// ── helpers ──────────────────────────────────────────────────────────────────

function parsePage(query) {
    const page  = Math.max(1, parseInt(query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    return { page, limit, skip: (page - 1) * limit };
}

function isMember(thread, userId) {
    return (
        thread.creator.toString() === userId ||
        thread.participants.some((p) => p.toString() === userId)
    );
}

// ── Thread CRUD ───────────────────────────────────────────────────────────────

const createThread = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title } = req.body;
        const rawParticipants = Array.isArray(req.body.participants) ? req.body.participants : [];

        const participants = rawParticipants.filter(
            (id) => mongoose.Types.ObjectId.isValid(id) && id.toString() !== req.user.id
        );

        const thread = await Thread.create({ title, creator: req.user.id, participants });
        await thread.populate("creator",      "firstname lastname email");
        await thread.populate("participants", "firstname lastname email");
        res.status(201).json({ message: "Thread created successfully", data: thread });
    } catch {
        res.status(500).json({ message: "Error creating thread" });
    }
};

const getThreads = async (req, res) => {
    try {
        const { page, limit, skip } = parsePage(req.query);
        const { search } = req.query;

        const base = req.user.role === "admin"
            ? {}
            : { $or: [{ creator: req.user.id }, { participants: req.user.id }] };

        const filter = search
            ? { ...base, $text: { $search: String(search) } }
            : base;

        const [threads, total] = await Promise.all([
            Thread.find(filter)
                .populate("creator",      "firstname lastname email")
                .populate("participants", "firstname lastname email")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            Thread.countDocuments(filter),
        ]);

        res.status(200).json({ data: threads, total, page, pages: Math.ceil(total / limit) });
    } catch {
        res.status(500).json({ message: "Error fetching threads" });
    }
};

const getThreadById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const thread = await Thread.findById(req.params.id)
            .populate("creator",      "firstname lastname email")
            .populate("participants", "firstname lastname email");

        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (req.user.role !== "admin" && !isMember(thread, req.user.id))
            return res.status(403).json({ message: "Access denied" });

        res.status(200).json({ data: thread });
    } catch {
        res.status(500).json({ message: "Error fetching thread" });
    }
};

const updateThread = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (thread.creator.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ message: "Only the creator can update this thread" });

        thread.title = req.body.title.trim();
        await thread.save();
        await thread.populate("creator",      "firstname lastname email");
        await thread.populate("participants", "firstname lastname email");

        res.status(200).json({ message: "Thread updated successfully", data: thread });
    } catch {
        res.status(500).json({ message: "Error updating thread" });
    }
};

const deleteThread = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (thread.creator.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ message: "Only the creator can delete this thread" });

        await Message.deleteMany({ thread: thread._id });
        await thread.deleteOne();

        res.status(200).json({ message: "Thread deleted successfully" });
    } catch {
        res.status(500).json({ message: "Error deleting thread" });
    }
};

// ── Message CRUD ──────────────────────────────────────────────────────────────

const addMessage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (req.user.role !== "admin" && !isMember(thread, req.user.id))
            return res.status(403).json({ message: "Access denied" });

        const message = await Message.create({
            thread:  thread._id,
            sender:  req.user.id,
            content: req.body.content,
        });
        await message.populate("sender", "firstname lastname email");

        res.status(201).json({ message: "Message sent successfully", data: message });
    } catch {
        res.status(500).json({ message: "Error sending message" });
    }
};

const getMessages = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (req.user.role !== "admin" && !isMember(thread, req.user.id))
            return res.status(403).json({ message: "Access denied" });

        const { page, limit, skip } = parsePage(req.query);

        const [messages, total] = await Promise.all([
            Message.find({ thread: thread._id })
                .populate("sender", "firstname lastname email")
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),
            Message.countDocuments({ thread: thread._id }),
        ]);

        res.status(200).json({ data: messages, total, page, pages: Math.ceil(total / limit) });
    } catch {
        res.status(500).json({ message: "Error fetching messages" });
    }
};

const updateMessage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { id: threadId, msgId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(threadId) || !mongoose.Types.ObjectId.isValid(msgId))
            return res.status(400).json({ message: "Invalid ID" });

        const message = await Message.findOne({ _id: msgId, thread: threadId });
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.sender.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ message: "Only the sender can edit this message" });

        message.content = req.body.content.trim();
        message.edited  = true;
        await message.save();
        await message.populate("sender", "firstname lastname email");

        res.status(200).json({ message: "Message updated successfully", data: message });
    } catch {
        res.status(500).json({ message: "Error updating message" });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id: threadId, msgId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(threadId) || !mongoose.Types.ObjectId.isValid(msgId))
            return res.status(400).json({ message: "Invalid ID" });

        const message = await Message.findOne({ _id: msgId, thread: threadId });
        if (!message) return res.status(404).json({ message: "Message not found" });

        const isMessageSender = message.sender.toString() === req.user.id;
        if (!isMessageSender && req.user.role !== "admin") {
            const thread = await Thread.findById(threadId, "creator").lean();
            const isThreadCreator = thread?.creator.toString() === req.user.id;
            if (!isThreadCreator)
                return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await message.deleteOne();
        res.status(200).json({ message: "Message deleted successfully" });
    } catch {
        res.status(500).json({ message: "Error deleting message" });
    }
};

module.exports = {
    createThread, getThreads, getThreadById, updateThread, deleteThread,
    addMessage, getMessages, updateMessage, deleteMessage,
};
