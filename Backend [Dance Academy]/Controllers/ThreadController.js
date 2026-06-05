const { validationResult } = require("express-validator");
const Thread = require("../Models/ThreadModel");
const Message = require("../Models/MessageModel");

const createThread = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title, participants } = req.body;
        const thread = await Thread.create({
            title,
            creator: req.user.id,
            participants: participants || [],
        });
        await thread.populate("creator", "firstname lastname email");
        await thread.populate("participants", "firstname lastname email");
        res.status(201).json({ message: "Thread created successfully", data: thread });
    } catch (error) {
        res.status(500).json({ message: "Error creating thread", error: error.message });
    }
};

const getThreads = async (req, res) => {
    try {
        const threads = await Thread.find({
            $or: [{ creator: req.user.id }, { participants: req.user.id }],
        })
            .populate("creator", "firstname lastname email")
            .populate("participants", "firstname lastname email")
            .sort({ updatedAt: -1 });
        res.status(200).json({ data: threads });
    } catch (error) {
        res.status(500).json({ message: "Error fetching threads", error: error.message });
    }
};

const getThreadById = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id)
            .populate("creator", "firstname lastname email")
            .populate("participants", "firstname lastname email");

        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const isMember =
            thread.creator._id.toString() === req.user.id ||
            thread.participants.some((p) => p._id.toString() === req.user.id);

        if (!isMember) return res.status(403).json({ message: "Access denied" });

        res.status(200).json({ data: thread });
    } catch (error) {
        res.status(500).json({ message: "Error fetching thread", error: error.message });
    }
};

const updateThread = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (thread.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the creator can update this thread" });
        }

        thread.title = req.body.title.trim();
        await thread.save();
        await thread.populate("creator", "firstname lastname email");
        await thread.populate("participants", "firstname lastname email");

        res.status(200).json({ message: "Thread updated successfully", data: thread });
    } catch (error) {
        res.status(500).json({ message: "Error updating thread", error: error.message });
    }
};

const deleteThread = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (thread.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the creator can delete this thread" });
        }

        await Message.deleteMany({ thread: thread._id });
        await thread.deleteOne();

        res.status(200).json({ message: "Thread deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting thread", error: error.message });
    }
};

const addMessage = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const isMember =
            thread.creator.toString() === req.user.id ||
            thread.participants.some((p) => p.toString() === req.user.id);

        if (!isMember) return res.status(403).json({ message: "Access denied" });

        const message = await Message.create({
            thread: thread._id,
            sender: req.user.id,
            content: req.body.content,
        });
        await message.populate("sender", "firstname lastname email");

        res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const isMember =
            thread.creator.toString() === req.user.id ||
            thread.participants.some((p) => p.toString() === req.user.id);

        if (!isMember) return res.status(403).json({ message: "Access denied" });

        const messages = await Message.find({ thread: thread._id })
            .populate("sender", "firstname lastname email")
            .sort({ createdAt: 1 });

        res.status(200).json({ data: messages });
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
};

module.exports = { createThread, getThreads, getThreadById, updateThread, deleteThread, addMessage, getMessages };
