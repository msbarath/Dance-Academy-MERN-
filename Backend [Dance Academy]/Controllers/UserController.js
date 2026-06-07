const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const mongoose   = require("mongoose");
const { validationResult } = require("express-validator");
const User       = require("../Models/UserModel");
const PasswordResetToken    = require("../Models/PasswordResetTokenModel");
const { sendPasswordResetEmail } = require("../Utils/resetTokenStore");

const generateToken = (user) =>
    jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d", algorithm: "HS256" }
    );

const formatUser = (u) => ({
    id:        u._id,
    firstname: u.firstname,
    lastname:  u.lastname,
    email:     u.email,
    phone:     u.phone,
    role:      u.role,
});

const SignUpUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { firstname, lastname, phone, password } = req.body;
        const email = req.body.email.trim().toLowerCase();

        const savedUser = await User.create({
            firstname: firstname.trim(),
            lastname:  lastname.trim(),
            email,
            phone:     phone ? String(phone).trim() : undefined,
            password:  await bcrypt.hash(password, 12),
        });

        res.status(201).json({
            message: "User registered successfully",
            token:   generateToken(savedUser),
            data:    formatUser(savedUser),
        });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
        res.status(500).json({ message: "Error registering user" });
    }
};

const LoginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const email    = req.body.email.trim().toLowerCase();
        const password = String(req.body.password);

        // lean() cannot be used here — password field uses select:false, needs Mongoose doc for .select("+password")
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", token: generateToken(user), data: formatUser(user) });
    } catch (err) {
        res.status(500).json({ message: "Error logging in" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ data: formatUser(user) });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone } = req.body;
        const update = {};
        if (firstname && typeof firstname === "string") update.firstname = firstname.trim();
        if (lastname  && typeof lastname  === "string") update.lastname  = lastname.trim();
        if (phone !== undefined) update.phone = typeof phone === "string" ? phone.trim() : "";

        if (!update.firstname || !update.lastname) {
            return res.status(400).json({ message: "First name and last name are required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            update,
            { new: true, runValidators: true }
        ).lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated", data: formatUser(user) });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip  = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(),
        ]);
        res.json({ data: users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) return res.status(400).json({ message: "Cannot delete yourself" });
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
        const user = await User.findById(req.params.id).select("role").lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin accounts" });
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

const requestPasswordReset = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const ok = { message: "If that email is registered, a reset link has been sent." };
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const user  = await User.findOne({ email }).lean();
        if (!user || user.role === "admin") return res.status(200).json(ok);

        const token = await PasswordResetToken.createToken(email);
        await sendPasswordResetEmail(email, token);
        res.json(ok);
    } catch (err) {
        res.status(500).json({ message: "Error processing request" });
    }
};

const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || typeof resetToken !== "string") {
            return res.status(400).json({ message: "Reset token is required" });
        }

        const email = await PasswordResetToken.consumeToken(resetToken.trim());
        if (!email) {
            return res.status(400).json({ message: "Reset token is invalid or has expired" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || user.role === "admin") {
            return res.status(400).json({ message: "Reset token is invalid or has expired" });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password" });
    }
};

module.exports = { SignUpUser, LoginUser, getProfile, updateProfile, getAllUsers, deleteUser, requestPasswordReset, resetPassword };
