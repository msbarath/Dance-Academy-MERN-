const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
    {
        name:    { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        email:   { type: String, required: true, trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"] },
        message: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    },
    { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Contact", ContactSchema);
