const { validationResult } = require("express-validator");
const Student = require("../Models/StudentModel");

const getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({ data: students });
    } catch (err) {
        res.status(500).json({ message: "Error fetching students", error: err.message });
    }
};

const createStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const existing = await Student.findOne({ email: req.body.email.trim().toLowerCase() });
        if (existing) return res.status(409).json({ message: "A student with this email already exists." });

        const student = await Student.create(req.body);
        res.status(201).json({ message: "Student enrolled", data: student });
    } catch (err) {
        res.status(500).json({ message: "Error enrolling student", error: err.message });
    }
};

const updateStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, phone, course } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, phone, course },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student updated", data: student });
    } catch (err) {
        res.status(500).json({ message: "Error updating student", error: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student", error: err.message });
    }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };
