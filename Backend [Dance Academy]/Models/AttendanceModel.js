const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        studentName: { type: String, required: true },
        course:      { type: String, required: true },
        date:        { type: String, required: true },
        status:      { type: String, enum: ["Present", "Absent"], default: "Present" },
    },
    { timestamps: true }
);

AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
