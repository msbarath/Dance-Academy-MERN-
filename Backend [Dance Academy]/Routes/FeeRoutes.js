const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getFees, recordFee, updateFee, deleteFee } = require("../Controllers/FeeController");

const feeValidation = [
    body("studentId").notEmpty().withMessage("Student is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("month").notEmpty().withMessage("Month is required"),
    body("status").isIn(["Paid", "Pending"]).withMessage("Invalid status"),
];

router.get("/",       protect, adminOnly, getFees);
router.post("/",      protect, adminOnly, feeValidation, recordFee);
router.put("/:id",    protect, adminOnly, updateFee);
router.delete("/:id", protect, adminOnly, deleteFee);

module.exports = router;
