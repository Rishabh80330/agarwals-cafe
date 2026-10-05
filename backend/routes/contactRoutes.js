const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Contact submission rate limiter: 10 requests per 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many contact messages submitted, please try again after 15 minutes.",
  },
});

// Public
router.post("/", contactLimiter, createContactMessage);

// Admin
router.get("/", protect, adminOnly, getAllContactMessages);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateContactMessageStatus
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteContactMessage
);

module.exports = router;