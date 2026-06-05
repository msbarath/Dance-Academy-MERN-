const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
    {
        name:       { type: String, required: true, trim: true },
        instructor: { type: String, required: true, trim: true },
        schedule:   { type: String, required: true, trim: true },
        fee:        { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
