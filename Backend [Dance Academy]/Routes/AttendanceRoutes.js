const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getAttendance, markAttendance, updateAttendance, deleteAttendance } = require("../Controllers/AttendanceController");

const attendanceValidation = [
    body("studentId").notEmpty().withMessage("Student is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("status").isIn(["Present", "Absent"]).withMessage("Invalid status"),
];

router.get("/",       protect, adminOnly, getAttendance);
router.post("/",      protect, adminOnly, attendanceValidation, markAttendance);
router.put("/:id",    protect, adminOnly, updateAttendance);
router.delete("/:id", protect, adminOnly, deleteAttendance);

module.exports = router;
