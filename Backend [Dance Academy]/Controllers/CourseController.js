const { validationResult } = require("express-validator");
const Course = require("../Models/CourseModel");

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ data: courses });
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses", error: err.message });
    }
};

const createCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const course = await Course.create(req.body);
        res.status(201).json({ message: "Course created", data: course });
    } catch (err) {
        res.status(500).json({ message: "Error creating course", error: err.message });
    }
};

const updateCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body, fee: Number(req.body.fee) },
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course updated", data: course });
    } catch (err) {
        res.status(500).json({ message: "Error updating course", error: err.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting course", error: err.message });
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
