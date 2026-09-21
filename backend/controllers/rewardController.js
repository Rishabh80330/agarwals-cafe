const Reward = require("../models/Reward");

// Get active rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({
      isActive: true,
    }).sort({
      pointsRequired: 1,
    });

    res.json({
      success: true,
      count: rewards.length,
      rewards,
    });
  } catch (error) {
    console.error("Get rewards error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards",
    });
  }
};

// Create reward - Admin
const createReward = async (req, res) => {
  try {
    const {
      name,
      description,
      pointsRequired,
      discountType,
      discountValue,
      isActive,
    } = req.body;

    if (
      !name ||
      pointsRequired === undefined ||
      !discountType ||
      discountValue === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, points required, discount type and discount value are required",
      });
    }

    if (!["fixed", "percentage"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100",
      });
    }

    const reward = await Reward.create({
      name,
      description,
      pointsRequired,
      discountType,
      discountValue,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Reward created successfully",
      reward,
    });
  } catch (error) {
    console.error("Create reward error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create reward",
    });
  }
};

// Update reward - Admin
const updateReward = async (req, res) => {
  try {
    const {
      name,
      description,
      pointsRequired,
      discountType,
      discountValue,
      isActive,
    } = req.body;

    if (
      discountType &&
      !["fixed", "percentage"].includes(discountType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (
      discountType === "percentage" &&
      discountValue !== undefined &&
      discountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100",
      });
    }

    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        pointsRequired,
        discountType,
        discountValue,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      message: "Reward updated successfully",
      reward,
    });
  } catch (error) {
    console.error("Update reward error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update reward",
    });
  }
};

// Deactivate reward - Admin
const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.json({
      success: true,
      message: "Reward deactivated successfully",
    });
  } catch (error) {
    console.error("Delete reward error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate reward",
    });
  }
};

module.exports = {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
};