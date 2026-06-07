const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Contact = require("../Models/ContactModel");

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
        res.json({ data: contacts });
    } catch {
        res.status(500).json({ message: "Error fetching messages" });
    }
};

const createContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const name    = req.body.name.trim();
        const email   = req.body.email.trim().toLowerCase();
        const message = req.body.message.trim();
        const contact = await Contact.create({ name, email, message });
        res.status(201).json({ message: "Message sent successfully", data: contact });
    } catch (err) {
        res.status(500).json({ message: "Error sending message" });
    }
};

const deleteContact = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting message" });
    }
};

module.exports = { getContacts, createContact, deleteContact };
