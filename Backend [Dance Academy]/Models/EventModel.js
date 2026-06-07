const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
        type:        {
            type:    String,
            enum:    ["Event", "Competition", "Workshop", "Recital"],
            default: "Event",
        },
        date:        {
            type:     String,
            required: true,
            match:    [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
            index:    true,
        },
        venue:       { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, default: "", maxlength: 2000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
