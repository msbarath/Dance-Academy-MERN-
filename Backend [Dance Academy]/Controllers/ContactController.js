const { validationResult } = require("express-validator");
const Contact = require("../Models/ContactModel");

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ data: contacts });
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages", error: err.message });
    }
};

const createContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ message: "Message sent successfully", data: contact });
    } catch (err) {
        res.status(500).json({ message: "Error sending message", error: err.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting message", error: err.message });
    }
};

module.exports = { getContacts, createContact, deleteContact };
