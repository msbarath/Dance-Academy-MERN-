const express = require("express");
const router  = express.Router();
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
    updateMessage,
    deleteMessage,
} = require("../Controllers/ThreadController");

router.use(protect);

const titleValidation   = body("title").trim().notEmpty().withMessage("Thread title is required");
const contentValidation = body("content")
    .trim().notEmpty().withMessage("Message content is required")
    .isLength({ max: 1000 }).withMessage("Message cannot exceed 1000 characters");

// Thread CRUD
router.post("/",    [titleValidation],   createThread);
router.get("/",                          getThreads);
router.get("/:id",                       getThreadById);
router.put("/:id",  [titleValidation],   updateThread);
router.delete("/:id",                    deleteThread);

// Message CRUD
router.post("/:id/messages",               [contentValidation], addMessage);
router.get("/:id/messages",                                     getMessages);
router.put("/:id/messages/:msgId",         [contentValidation], updateMessage);
router.delete("/:id/messages/:msgId",                           deleteMessage);

module.exports = router;
