const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
        studentName: { type: String, required: true, trim: true },
        course:      { type: String, required: true, trim: true, index: true },
        date:        {
            type:     String,
            required: true,
            match:    [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
            validate: {
                validator: (v) => !isNaN(new Date(v).getTime()),
                message:   "Invalid date value",
            },
        },
        status: { type: String, enum: ["Present", "Absent"], default: "Present" },
    },
    { timestamps: true }
);

// Unique: one record per student per date
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });
// Optimise list queries filtered by date or course
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ course: 1, date: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
