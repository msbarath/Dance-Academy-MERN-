const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../Controllers/EventController");

const eventValidation = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("venue").trim().notEmpty().withMessage("Venue is required"),
    body("type").isIn(["Event", "Competition", "Workshop", "Recital"]).withMessage("Invalid type"),
];

router.get("/",       getEvents);
router.post("/",      protect, adminOnly, eventValidation, createEvent);
router.put("/:id",    protect, adminOnly, eventValidation, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;
