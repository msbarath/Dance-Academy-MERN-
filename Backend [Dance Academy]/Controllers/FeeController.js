const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Fee = require("../Models/FeeModel");
const Student = require("../Models/StudentModel");

const MONTH_RE = /^\d{4}-\d{2}$/;

const getFees = async (req, res) => {
    try {
        const filter = {};
        const { month } = req.query;
        if (month) {
            if (!MONTH_RE.test(month)) return res.status(400).json({ message: "Invalid month format. Use YYYY-MM." });
            filter.month = String(month);
        }
        const fees = await Fee.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ data: fees });
    } catch {
        res.status(500).json({ message: "Error fetching fees" });
    }
};

const recordFee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { studentId, amount, month, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ message: "Invalid student ID" });
        const student = await Student.findById(studentId).lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        const fee = await Fee.create({
            student:     studentId,
            studentName: student.name,
            course:      student.course,
            amount:      Number(amount),
            month,
            status:      status || "Paid",
        });
        res.status(201).json({ message: "Fee recorded", data: fee });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "A fee record already exists for this student and month." });
        }
        res.status(500).json({ message: "Error recording fee" });
    }
};

const updateFee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const { amount, month, status } = req.body;
        const update = { amount: Number(amount), status };
        if (month) update.month = month;
        const fee = await Fee.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.json({ message: "Fee updated", data: fee });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: "A fee record already exists for this student and month." });
        res.status(500).json({ message: "Error updating fee" });
    }
};

const deleteFee = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.json({ message: "Fee deleted" });
    } catch {
        res.status(500).json({ message: "Error deleting fee" });
    }
};

module.exports = { getFees, recordFee, updateFee, deleteFee };
