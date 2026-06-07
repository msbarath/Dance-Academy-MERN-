const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
    {
        name:       { type: String, required: true, trim: true, unique: true, minlength: 2, maxlength: 100 },
        instructor: { type: String, required: true, trim: true, index: true },
        schedule:   { type: String, required: true, trim: true },
        fee:        { type: Number, required: true, min: 1, max: 1000000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
