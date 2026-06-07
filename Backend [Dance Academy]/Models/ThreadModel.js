const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema(
    {
        title:        { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
        creator:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

ThreadSchema.index({ title: "text" });
// Compound index: covers the dominant user-thread list query (creator + sort by updatedAt)
ThreadSchema.index({ creator: 1, updatedAt: -1 });
// Index participants array for membership queries
ThreadSchema.index({ participants: 1 });

module.exports = mongoose.model("Thread", ThreadSchema);
