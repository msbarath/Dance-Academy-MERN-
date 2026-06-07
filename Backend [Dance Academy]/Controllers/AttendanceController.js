const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Attendance = require("../Models/AttendanceModel");
const Student = require("../Models/StudentModel");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const getAttendance = async (req, res) => {
    try {
        const filter = {};
        const { date, course } = req.query;
        // Strict whitelist validation before using in query — prevents NoSQL injection
        if (date   && DATE_RE.test(date)   && !isNaN(new Date(date).getTime()))   filter.date   = date;
        if (course && typeof course === "string" && course.trim()) filter.course = course.trim();
        const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 }).lean();
        res.json({ data: records });
    } catch (err) {
        res.status(500).json({ message: "Error fetching attendance" });
    }
};

const markAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { studentId, status } = req.body;
        const date = String(req.body.date || "");

        if (!mongoose.Types.ObjectId.isValid(studentId))
            return res.status(400).json({ message: "Invalid student ID" });

        // Fetch student first — validates reference exists
        const student = await Student.findById(studentId).lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Use findOneAndUpdate with upsert:false + unique index as the authoritative duplicate guard
        // The pre-check below gives a friendlier 409 before hitting the DB unique constraint
        const exists = await Attendance.exists({ student: studentId, date });
        if (exists) return res.status(409).json({ message: "Attendance already marked for this student on this date." });

        const record = await Attendance.create({
            student:     studentId,
            studentName: student.name,
            course:      student.course,
            date,
            status:      status || "Present",
        });
        res.status(201).json({ message: "Attendance marked", data: record });
    } catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: "Attendance already marked for this student on this date." });
        res.status(500).json({ message: "Error marking attendance" });
    }
};

const updateAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });
        const record = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance updated", data: record });
    } catch (err) {
        res.status(500).json({ message: "Error updating attendance" });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting attendance" });
    }
};

module.exports = { getAttendance, markAttendance, updateAttendance, deleteAttendance };
