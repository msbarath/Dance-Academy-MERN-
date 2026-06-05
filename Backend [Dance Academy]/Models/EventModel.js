const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true, trim: true },
        type:        { type: String, enum: ["Event", "Competition", "Workshop", "Recital"], default: "Event" },
        date:        { type: String, required: true },
        venue:       { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
