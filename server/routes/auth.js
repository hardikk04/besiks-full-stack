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

// Test endpoint to debug cookie setting
router.get("/test-cookie", (req, res) => {
  res.cookie("test-cookie", "test-value", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60, // 1 hour
    path: '/',
  });
  
  res.json({
    success: true,
    message: "Test cookie set",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;