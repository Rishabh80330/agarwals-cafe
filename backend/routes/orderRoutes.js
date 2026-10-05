const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  createOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  handleRazorpayWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Order creation rate limiter: 30 orders per 15 minutes
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many orders placed, please try again after 15 minutes.",
  },
});

// Customer
router.post("/", orderCreationLimiter, protect, createOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/failure", protect, handlePaymentFailure);
router.post("/razorpay/webhook", handleRazorpayWebhook);

router.get("/my-orders", protect, getMyOrders);

// Admin
router.get("/", protect, adminOnly, getAllOrders);

router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;