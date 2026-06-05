const { validationResult } = require("express-validator");
const Event = require("../Models/EventModel");

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json({ data: events });
    } catch (err) {
        res.status(500).json({ message: "Error fetching events", error: err.message });
    }
};

const createEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const event = await Event.create(req.body);
        res.status(201).json({ message: "Event created", data: event });
    } catch (err) {
        res.status(500).json({ message: "Error creating event", error: err.message });
    }
};

const updateEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event updated", data: event });
    } catch (err) {
        res.status(500).json({ message: "Error updating event", error: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting event", error: err.message });
    }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
