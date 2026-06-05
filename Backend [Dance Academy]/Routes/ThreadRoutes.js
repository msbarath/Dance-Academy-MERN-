const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect } = require("../Utils/authMiddleware");
const {
    createThread,
    getThreads,
    getThreadById,
    updateThread,
    deleteThread,
    addMessage,
    getMessages,
} = require("../Controllers/ThreadController");

router.use(protect);

router.post(
    "/",
    [body("title").trim().notEmpty().withMessage("Thread title is required")],
    createThread
);

router.get("/", getThreads);
router.get("/:id", getThreadById);

router.put(
    "/:id",
    [body("title").trim().notEmpty().withMessage("Thread title is required")],
    updateThread
);

router.delete("/:id", deleteThread);

router.post(
    "/:id/messages",
    [body("content").trim().notEmpty().withMessage("Message content is required")],
    addMessage
);

router.get("/:id/messages", getMessages);

module.exports = router;
