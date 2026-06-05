const { validationResult } = require("express-validator");
const Attendance = require("../Models/AttendanceModel");
const Student = require("../Models/StudentModel");

const getAttendance = async (req, res) => {
    try {
        const filter = {};
        if (req.query.date) filter.date = req.query.date;
        const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });
        res.json({ data: records });
    } catch (err) {
        res.status(500).json({ message: "Error fetching attendance", error: err.message });
    }
};

const markAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { studentId, date, status } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const existing = await Attendance.findOne({ student: studentId, date });
        if (existing) return res.status(409).json({ message: "Attendance already marked for this student on this date." });

        const record = await Attendance.create({
            student:     studentId,
            studentName: student.name,
            course:      student.course,
            date,
            status: status || "Present",
        });
        res.status(201).json({ message: "Attendance marked", data: record });
    } catch (err) {
        res.status(500).json({ message: "Error marking attendance", error: err.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Present", "Absent"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const record = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance updated", data: record });
    } catch (err) {
        res.status(500).json({ message: "Error updating attendance", error: err.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting attendance", error: err.message });
    }
};

module.exports = { getAttendance, markAttendance, updateAttendance, deleteAttendance };
