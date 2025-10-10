const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  getCoupons,
  getActiveCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  updateCouponStatus,
} = require("../controllers/couponController");

// Public routes
router.get("/active", getActiveCoupons);

// Protected routes
router.post("/validate", protect, validateCoupon);

// Admin routes
router.get("/", protect, admin, getCoupons);
router.get("/:id", protect, admin, getCoupon);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

// @route   PUT /api/coupon/:id/status
// @desc    Update coupon active status
// @access  Private (Admin only)
router.put("/:id/status", protect,admin, updateCouponStatus);

module.exports = router;