const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// ADMIN
// =========================

router.get(
  "/",
  protect,
  adminOnly,
  getAllUsers
);

// =========================
// CUSTOMER PROFILE
// =========================

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.put(
  "/profile",
  protect,
  updateMyProfile
);

// =========================
// CUSTOMER ADDRESSES
// =========================

router.post(
  "/addresses",
  protect,
  addAddress
);

router.put(
  "/addresses/:addressId",
  protect,
  updateAddress
);

router.delete(
  "/addresses/:addressId",
  protect,
  deleteAddress
);

module.exports = router;