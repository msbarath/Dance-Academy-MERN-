const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Event = require("../Models/EventModel");

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).lean();
        res.json({ data: events });
    } catch {
        res.status(500).json({ message: "Error fetching events" });
    }
};

const createEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title, type, date, venue, description } = req.body;
        const event = await Event.create({ title, type, date, venue, description });
        res.status(201).json({ message: "Event created", data: event });
    } catch (err) {
        res.status(500).json({ message: "Error creating event" });
    }
};

const updateEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const { title, type, date, venue, description } = req.body;
        const update = { title, type, date, venue };
        if (description !== undefined) update.description = description;
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event updated", data: event });
    } catch (err) {
        res.status(500).json({ message: "Error updating event" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting event" });
    }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
