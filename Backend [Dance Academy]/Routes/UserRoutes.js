const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const {
    SignUpUser,
    LoginUser,
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    requestPasswordReset,
    resetPassword,
} = require("../Controllers/UserController");
const { protect, adminOnly } = require("../Utils/authMiddleware");

const signupValidation = [
    body("firstname").trim().notEmpty().withMessage("First name is required"),
    body("lastname").trim().notEmpty().withMessage("Last name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone")
        .optional()
        .matches(/^[6-9][0-9]{9}$/)
        .withMessage("Valid 10-digit Indian mobile number required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and a number"),
];

const loginValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

const requestResetValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
];

const resetPasswordValidation = [
    body("resetToken").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and a number"),
];

router.post("/signup",          signupValidation,        SignUpUser);
router.post("/login",           loginValidation,         LoginUser);
router.post("/request-reset",   requestResetValidation,  requestPasswordReset);
router.post("/reset-password",  resetPasswordValidation, resetPassword);
router.get("/profile",          protect,                 getProfile);
router.put("/profile",          protect,                 updateProfile);
router.get("/all",              protect, adminOnly,       getAllUsers);
router.delete("/:id",           protect, adminOnly,       deleteUser);

module.exports = router;
