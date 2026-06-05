const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getContacts, createContact, deleteContact } = require("../Controllers/ContactController");

const contactValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("message").trim().isLength({ min: 10, max: 500 }).withMessage("Message must be 10-500 characters"),
];

router.get("/", protect, adminOnly, getContacts);
router.post("/", contactValidation, createContact);
router.delete("/:id", protect, adminOnly, deleteContact);

module.exports = router;
