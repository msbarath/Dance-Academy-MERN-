const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getStudents, createStudent, updateStudent, deleteStudent, getStudentCount } = require("../Controllers/StudentController");

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});

const studentValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9][0-9]{9}$/).withMessage("Valid 10-digit Indian mobile number required"),
    body("course").trim().notEmpty().withMessage("Course is required"),
];

const updateValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9][0-9]{9}$/).withMessage("Valid 10-digit Indian mobile number required"),
    body("course").trim().notEmpty().withMessage("Course is required"),
];

router.get("/count",  publicLimiter, getStudentCount);
router.get("/",        protect, adminOnly, getStudents);
router.post("/",       protect, adminOnly, studentValidation, createStudent);
router.put("/:id",     protect, adminOnly, updateValidation,  updateStudent);
router.delete("/:id", protect, adminOnly, deleteStudent);

module.exports = router;
