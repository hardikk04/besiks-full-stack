const express = require("express");
const { body } = require("express-validator");
const {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth.protect, getUserProfile);

router.get("/all", getAllUsers);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    auth.protect,
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
  ],
  updateUserProfile
);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put(
  "/password",
  [
    auth.protect,
    body("currentPassword", "Current password is required").exists(),
    body("newPassword", "New password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  updateUserPassword
);

module.exports = router;