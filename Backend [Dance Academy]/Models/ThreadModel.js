const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Thread", ThreadSchema);
