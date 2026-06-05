const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { SignUpUser, LoginUser, getProfile, updateProfile, getAllUsers, deleteUser, resetPassword } = require("../Controllers/UserController");
const { protect, adminOnly } = require("../Utils/authMiddleware");

const signupValidation = [
    body("firstname").trim().notEmpty().withMessage("First name is required"),
    body("lastname").trim().notEmpty().withMessage("Last name is required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").optional().isMobilePhone().withMessage("Valid phone number is required"),
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

const resetPasswordValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase and a number"),
];

router.post("/signup",         signupValidation,        SignUpUser);
router.post("/login",          loginValidation,         LoginUser);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.get("/profile",         protect,                 getProfile);
router.put("/profile",         protect,                 updateProfile);
router.get("/all",             protect, adminOnly,       getAllUsers);
router.delete("/:id",          protect, adminOnly,       deleteUser);

module.exports = router;
