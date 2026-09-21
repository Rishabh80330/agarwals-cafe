const express = require("express");

const {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
} = require("../controllers/rewardController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public - customers can see active rewards
router.get("/", getRewards);

// Admin
router.post("/", protect, adminOnly, createReward);
router.put("/:id", protect, adminOnly, updateReward);
router.delete("/:id", protect, adminOnly, deleteReward);

module.exports = router;