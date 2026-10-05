const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const rewardRedemptionRoutes = require("./routes/rewardRedemptionRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api", generalLimiter);

app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rewards", rewardRoutes);
app.use(
  "/api/reward-redemptions",
  rewardRedemptionRoutes
);
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Agarwal's Cafe API is running ☕",
  });
});

// API 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode >= 400 && statusCode < 500 && err.message
      ? err.message
      : "Internal server error.";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Agarwal's Cafe server running on port ${PORT}`);
});