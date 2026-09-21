const express = require("express");

const {
  redeemReward,
  getMyRedemptions,
} = require("../controllers/rewardRedemptionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, redeemReward);

router.get("/my", protect, getMyRedemptions);

module.exports = router;