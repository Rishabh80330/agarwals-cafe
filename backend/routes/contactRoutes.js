const express = require("express");

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

// Public
router.post("/", createContactMessage);

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