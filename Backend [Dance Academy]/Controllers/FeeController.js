const { validationResult } = require("express-validator");
const Fee = require("../Models/FeeModel");
const Student = require("../Models/StudentModel");

const getFees = async (req, res) => {
    try {
        const filter = {};
        if (req.query.month) filter.month = req.query.month;
        const fees = await Fee.find(filter).sort({ createdAt: -1 });
        res.json({ data: fees });
    } catch (err) {
        res.status(500).json({ message: "Error fetching fees", error: err.message });
    }
};

const recordFee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { studentId, amount, month, status } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const fee = await Fee.create({
            student:     studentId,
            studentName: student.name,
            course:      student.course,
            amount:      Number(amount),
            month,
            status: status || "Paid",
        });
        res.status(201).json({ message: "Fee recorded", data: fee });
    } catch (err) {
        res.status(500).json({ message: "Error recording fee", error: err.message });
    }
};

const updateFee = async (req, res) => {
    try {
        const { amount, month, status } = req.body;
        const fee = await Fee.findByIdAndUpdate(
            req.params.id,
            { amount: Number(amount), month, status },
            { new: true, runValidators: true }
        );
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.json({ message: "Fee updated", data: fee });
    } catch (err) {
        res.status(500).json({ message: "Error updating fee", error: err.message });
    }
};

const deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.json({ message: "Fee deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting fee", error: err.message });
    }
};

module.exports = { getFees, recordFee, updateFee, deleteFee };
