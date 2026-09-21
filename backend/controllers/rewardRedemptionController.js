const Reward = require("../models/Reward");
const User = require("../models/User");
const RewardRedemption = require("../models/RewardRedemption");

// Redeem reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: "Reward ID is required",
      });
    }

    const reward = await Reward.findOne({
      _id: rewardId,
      isActive: true,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or inactive",
      });
    }

    // Atomically deduct points only if user has enough
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        loyaltyPoints: {
          $gte: reward.pointsRequired,
        },
      },
      {
        $inc: {
          loyaltyPoints: -reward.pointsRequired,
        },
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Insufficient loyalty points",
      });
    }

    const redemption = await RewardRedemption.create({
      user: user._id,
      reward: reward._id,
      rewardName: reward.name,
      pointsUsed: reward.pointsRequired,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Reward redeemed successfully",
      redemption,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (error) {
    console.error("Redeem reward error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to redeem reward",
    });
  }
};

// Get user's redeemed rewards
const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await RewardRedemption.find({
      user: req.user._id,
    })
      .populate("reward", "name description")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: redemptions.length,
      redemptions,
    });
  } catch (error) {
    console.error("Get redemptions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch redeemed rewards",
    });
  }
};

module.exports = {
  redeemReward,
  getMyRedemptions,
};