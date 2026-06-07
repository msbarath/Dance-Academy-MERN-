const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../Controllers/EventController");

const eventValidation = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }).withMessage("Title must be 100 characters or fewer"),
    body("date")
        .notEmpty().withMessage("Date is required")
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be in YYYY-MM-DD format"),
    body("venue").trim().notEmpty().withMessage("Venue is required").isLength({ max: 100 }).withMessage("Venue must be 100 characters or fewer"),
    body("type").optional().isIn(["Event", "Competition", "Workshop", "Recital"]).withMessage("Invalid type"),
    body("description").optional({ nullable: true }).isLength({ max: 300 }).withMessage("Description must be 300 characters or fewer"),
];

router.get("/",       getEvents);
router.post("/",      protect, adminOnly, eventValidation, createEvent);
router.put("/:id",    protect, adminOnly, eventValidation, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;
