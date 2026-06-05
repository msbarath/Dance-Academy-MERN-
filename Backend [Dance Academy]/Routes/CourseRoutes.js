const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getCourses, createCourse, updateCourse, deleteCourse } = require("../Controllers/CourseController");

const courseValidation = [
    body("name").trim().notEmpty().withMessage("Course name is required"),
    body("instructor").trim().notEmpty().withMessage("Instructor is required"),
    body("schedule").trim().notEmpty().withMessage("Schedule is required"),
    body("fee").isNumeric().withMessage("Fee must be a number"),
];

router.get("/",       getCourses);
router.post("/",      protect, adminOnly, courseValidation, createCourse);
router.put("/:id",    protect, adminOnly, courseValidation, updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

module.exports = router;
