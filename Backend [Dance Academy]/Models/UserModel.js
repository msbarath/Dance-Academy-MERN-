const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        firstname: { type: String, required: true, trim: true },
        lastname:  { type: String, required: true, trim: true },
        email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
        phone:     { type: String, trim: true },
        role:      { type: String, enum: ["user", "admin"], default: "user" },
        password:  { type: String, required: true },
    },
    { timestamps: true }
);

UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
