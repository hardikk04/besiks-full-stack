const express = require("express");
const {
  loginUser,
  getMe,
  adminLogin,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/admin/login
// @desc    Login admin with email or password & get token
// @access  admin
router.post("/admin/login", adminLogin);

// @route   POST /api/auth/login
// @desc    Login user with email or phone & get token
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, getMe);

router.get("/admin/logout", logout);

module.exports = router;