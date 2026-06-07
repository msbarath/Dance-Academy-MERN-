const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
    {
        name:   { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        email:  { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"], index: true },
        phone:  {
            type:     String,
            required: true,
            trim:     true,
            match:    [/^[6-9][0-9]{9}$/, "Valid 10-digit Indian mobile number required"],
        },
        course: { type: String, required: true, trim: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
