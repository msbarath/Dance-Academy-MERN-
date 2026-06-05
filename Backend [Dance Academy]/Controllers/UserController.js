const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../Models/UserModel");

const generateToken = (user) =>
    jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
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
        const { firstname, lastname, email, phone, password } = req.body;
        if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });

        const savedUser = await User.create({
            firstname,
            lastname,
            email,
            phone,
            password: await bcrypt.hash(password, 12),
        });

        res.status(201).json({ message: "User registered successfully", token: generateToken(savedUser), data: formatUser(savedUser) });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

const LoginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", token: generateToken(user), data: formatUser(user) });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ data: user });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstname, lastname, phone },
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated", data: formatUser(user) });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json({ data: users });
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) return res.status(400).json({ message: "Cannot delete yourself" });
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({ message: "If an account exists, the password has been reset." });

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
};

module.exports = { SignUpUser, LoginUser, getProfile, updateProfile, getAllUsers, deleteUser, resetPassword };
