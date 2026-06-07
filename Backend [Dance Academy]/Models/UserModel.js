const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        firstname: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
        lastname:  { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
        email:     { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"] },
        phone:     { type: String, trim: true, match: [/^[0-9+\-\s]{7,20}$/, "Invalid phone number"] },
        role:      { type: String, enum: ["user", "admin"], default: "user", index: true },
        password:  { type: String, required: true, select: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
