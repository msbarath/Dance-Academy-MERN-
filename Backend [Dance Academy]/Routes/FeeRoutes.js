const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, adminOnly } = require("../Utils/authMiddleware");
const { getFees, recordFee, updateFee, deleteFee } = require("../Controllers/FeeController");

const feeValidation = [
    body("studentId").notEmpty().withMessage("Student is required"),
    body("amount").isNumeric().withMessage("Amount must be a number").custom(v => Number(v) > 0).withMessage("Amount must be positive"),
    body("month")
        .notEmpty().withMessage("Month is required")
        .matches(/^\d{4}-\d{2}$/).withMessage("Month must be in YYYY-MM format"),
    body("status").optional().isIn(["Paid", "Pending"]).withMessage("Invalid status"),
];

const updateFeeValidation = [
    body("amount").isNumeric().withMessage("Amount must be a number").custom(v => Number(v) > 0).withMessage("Amount must be positive"),
    body("month").optional().matches(/^\d{4}-\d{2}$/).withMessage("Month must be in YYYY-MM format"),
    body("status").optional().isIn(["Paid", "Pending"]).withMessage("Invalid status"),
];

router.get("/",       protect, adminOnly, getFees);
router.post("/",      protect, adminOnly, feeValidation, recordFee);
router.put("/:id",    protect, adminOnly, updateFeeValidation, updateFee);
router.delete("/:id", protect, adminOnly, deleteFee);

module.exports = router;
