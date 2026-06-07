const { validationResult } = require("express-validator");
const mongoose   = require("mongoose");
const Student    = require("../Models/StudentModel");
const Attendance = require("../Models/AttendanceModel");
const Fee        = require("../Models/FeeModel");

function isDuplicateKey(err) {
    return err.code === 11000;
}

const getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 }).lean();
        res.json({ data: students });
    } catch (err) {
        res.status(500).json({ message: "Error fetching students" });
    }
};

const createStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const name   = req.body.name.trim();
        const email  = req.body.email.trim().toLowerCase();
        const phone  = req.body.phone.trim();
        const course = req.body.course.trim();
        const student = await Student.create({ name, email, phone, course });
        res.status(201).json({ message: "Student enrolled", data: student });
    } catch (err) {
        if (isDuplicateKey(err)) return res.status(409).json({ message: "A student with this email already exists." });
        res.status(500).json({ message: "Error enrolling student" });
    }
};

const updateStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const name   = req.body.name?.trim();
        const phone  = req.body.phone?.trim();
        const course = req.body.course?.trim();
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, phone, course },
            { new: true, runValidators: true }
        ).lean();
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student updated", data: student });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: "A student with this email already exists." });
        res.status(500).json({ message: "Error updating student" });
    }
};

const deleteStudent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const student = await Student.findByIdAndDelete(req.params.id).lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        await Promise.all([
            Attendance.deleteMany({ student: student._id }),
            Fee.deleteMany({ student: student._id }),
        ]);

        res.json({ message: "Student and all related records deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student" });
    }
};

const getStudentCount = async (req, res) => {
    try {
        const count = await Student.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching count" });
    }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent, getStudentCount };
