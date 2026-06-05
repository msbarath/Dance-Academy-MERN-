const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getStudents, createStudent, updateStudent, deleteStudent } = require("../Controllers/StudentController");
const Student = require("../Models/StudentModel");

const studentValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("course").trim().notEmpty().withMessage("Course is required"),
];

const updateValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("course").trim().notEmpty().withMessage("Course is required"),
];

router.get("/count", async (req, res) => {
    try {
        const count = await Student.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching count", error: err.message });
    }
});

router.get("/",      protect, adminOnly, getStudents);
router.post("/",     protect, adminOnly, studentValidation,  createStudent);
router.put("/:id",   protect, adminOnly, updateValidation,   updateStudent);
router.delete("/:id",protect, adminOnly, deleteStudent);

module.exports = router;
