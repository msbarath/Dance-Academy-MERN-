const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getAttendance, markAttendance, updateAttendance, deleteAttendance } = require("../Controllers/AttendanceController");

const attendanceValidation = [
    body("studentId").notEmpty().withMessage("Student is required"),
    body("date")
        .notEmpty().withMessage("Date is required")
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be in YYYY-MM-DD format")
        .custom((value) => {
            const d = new Date(value);
            if (isNaN(d.getTime())) throw new Error("Invalid date");
            if (d > new Date()) throw new Error("Attendance date cannot be in the future");
            return true;
        }),
    body("status").optional().isIn(["Present", "Absent"]).withMessage("Invalid status"),
];

const updateAttendanceValidation = [
    body("status").isIn(["Present", "Absent"]).withMessage("Invalid status"),
];

router.get("/",       protect, adminOnly, getAttendance);
router.post("/",      protect, adminOnly, attendanceValidation, markAttendance);
router.put("/:id",    protect, adminOnly, updateAttendanceValidation, updateAttendance);
router.delete("/:id", protect, adminOnly, deleteAttendance);

module.exports = router;
