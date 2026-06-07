const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema(
    {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
        studentName: { type: String, required: true, trim: true },
        course:      { type: String, required: true, trim: true },
        amount:      { type: Number, required: true, min: 0, max: 1000000 },
        month:       { type: String, required: true, match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"], index: true },
        status:      { type: String, enum: ["Paid", "Pending"], default: "Paid", index: true },
    },
    { timestamps: true }
);

FeeSchema.index({ student: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Fee", FeeSchema);
