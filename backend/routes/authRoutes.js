const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Auth rate limiter: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again after 15 minutes.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;