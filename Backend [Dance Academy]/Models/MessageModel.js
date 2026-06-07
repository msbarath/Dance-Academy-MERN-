const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        thread:  { type: mongoose.Schema.Types.ObjectId, ref: "Thread", required: true, index: true },
        sender:  { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true, index: true },
        content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
        edited:  { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index: thread+createdAt covers the dominant paginated fetch pattern
MessageSchema.index({ thread: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
