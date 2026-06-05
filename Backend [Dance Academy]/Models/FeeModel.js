const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema(
    {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        studentName: { type: String, required: true },
        course:      { type: String, required: true },
        amount:      { type: Number, required: true },
        month:       { type: String, required: true },
        status:      { type: String, enum: ["Paid", "Pending"], default: "Paid" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Fee", FeeSchema);
