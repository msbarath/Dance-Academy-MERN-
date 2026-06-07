const express        = require("express");
const mongoose       = require("mongoose");
const cors           = require("cors");
const helmet         = require("helmet");
const compression    = require("compression");
const cookieParser   = require("cookie-parser");
const rateLimit      = require("express-rate-limit");
const mongoSanitize  = require("express-mongo-sanitize");

require("dotenv").config();

const userRoutes       = require("./Routes/UserRoutes");
const threadRoutes     = require("./Routes/ThreadRoutes");
const courseRoutes     = require("./Routes/CourseRoutes");
const studentRoutes    = require("./Routes/StudentRoutes");
const attendanceRoutes = require("./Routes/AttendanceRoutes");
const feeRoutes        = require("./Routes/FeeRoutes");
const eventRoutes      = require("./Routes/EventRoutes");
const contactRoutes    = require("./Routes/ContactRoutes");

if (!process.env.COOKIE_SECRET || !process.env.JWT_SECRET) {
    console.error("FATAL: Missing required environment variables (COOKIE_SECRET, JWT_SECRET)");
    process.exit(1);
}

if (!process.env.MONGODB_URL) {
    console.error("FATAL: MONGODB_URL environment variable is not set");
    process.exit(1);
}

const app = express();

app.set("trust proxy", 1);
app.use(compression());

function sanitizeRequest(req, _res, next) {
    ["body", "params"].forEach((key) => {
        if (req[key]) mongoSanitize.sanitize(req[key]);
    });

    if (req.query) {
        const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
        Object.defineProperty(req, "query", {
            value:        sanitizedQuery,
            writable:     true,
            enumerable:   true,
            configurable: true,
        });
    }

    next();
}

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(o => o.trim())
    : ["http://localhost:3000"];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials:    true,
    methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc:  ["'self'"],
                styleSrc:   ["'self'", "'unsafe-inline'"],
                imgSrc:     ["'self'", "data:", "https:"],
                connectSrc: ["'self'", ...allowedOrigins],
                fontSrc:    ["'self'"],
                objectSrc:  ["'none'"],
                frameSrc:   ["'none'"],
            },
        },
    })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sanitizeRequest);

const globalLimiter = rateLimit({
    windowMs:        15 * 60 * 1000,
    max:             200,
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
    windowMs:        15 * 60 * 1000,
    max:             20,
    standardHeaders: true,
    legacyHeaders:   false,
    message:         { message: "Too many auth attempts, please try again later." },
});

app.use("/api", globalLimiter);
app.use("/api/user/login",          authLimiter);
app.use("/api/user/signup",         authLimiter);
app.use("/api/user/request-reset",  authLimiter);
app.use("/api/user/reset-password", authLimiter);

const isProd = process.env.NODE_ENV === "production";

app.get("/",              (_req, res) => res.json({ message: "Dance Academy API is running" }));
app.get("/api/health", (_req, res) => {
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
        return res.status(503).json({ status: "error", db: "disconnected" });
    }
    res.json({ status: "ok", db: "connected" });
});
app.get("/api/db-status", (_req, res) => {
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    const state  = mongoose.connection.readyState;
    res.json({ db: states[state] || "unknown", readyState: state });
});

app.get("/api/csrf-token", (_req, res) => res.json({ csrfToken: "disabled" }));

app.use("/api/user",       userRoutes);
app.use("/api/threads",    threadRoutes);
app.use("/api/courses",    courseRoutes);
app.use("/api/students",   studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees",       feeRoutes);
app.use("/api/events",     eventRoutes);
app.use("/api/contact",    contactRoutes);

app.use((err, req, res, _next) => {
    if (
        err.message && err.message.startsWith("CORS:")) {
        return res.status(403).json({ message: err.message });
    }
    const message = isProd ? "Internal server error" : (err.message || "Internal server error");
    res.status(err.status || 500).json({ message });
});

async function seedAdmin() {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
    const bcrypt = require("bcryptjs");
    const User   = require("./Models/UserModel");
    try {
        const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!exists) {
            await User.create({
                firstname: "Admin",
                lastname:  "User",
                email:     process.env.ADMIN_EMAIL,
                phone:     "9000000000",
                password:  await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
                role:      "admin",
            });
            console.log("Admin user seeded successfully");
        }
    } catch (err) {
        console.error("seedAdmin failed:", err.message);
    }
}

const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", false);

let httpServer;

mongoose
    .connect(process.env.MONGODB_URL, {
        maxPoolSize:              10,
        minPoolSize:               2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS:          45000,
    })
    .then(async () => {
        await seedAdmin();
        httpServer = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });

function gracefulShutdown() {
    const finish = async () => {
        await mongoose.connection.close();
        process.exit(0);
    };

    if (httpServer) {
        httpServer.close(finish);
        setTimeout(() => process.exit(1), 10000).unref();
    } else {
        finish();
    }
}

process.on("SIGINT",  gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});
