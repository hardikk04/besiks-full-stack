const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const {
  validateCouponValidation,
  createCouponValidation,
} = require("../validation/coupon/validation");
const { mongooseIdValidation } = require("../validation/product/validation");

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",  
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching coupons",
    });
  }
};

// @desc    Get active coupons (public)
// @route   GET /api/coupons/active
// @access  Public
const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select("name description discountType discountValue minimumOrderAmount");

    res.status(200).json({
      success: true,
      message: "Active coupons fetched successfully", 
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Get active coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching active coupons",
    });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCoupon = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const coupon = await Coupon.findById(parsed.data);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon fetched successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching coupon",
    });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const parsed = createCouponValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      validFrom,
      validUntil,
      usageLimit,
      userUsageLimit,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
      isFirstTimeUser,
      isNewUser,
    } = parsed.data;

    if (
      !code ||
      !name ||
      !discountType ||
      !discountValue ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon with this code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit,
      userUsageLimit: userUsageLimit || 1,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
      isFirstTimeUser: isFirstTimeUser || false,
      isNewUser: isNewUser || false,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating coupon",
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    let coupon = await Coupon.findById(parsed.data);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check if new code conflicts with existing coupon
    if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: req.body.code.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon with this code already exists",
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key === "code") {
        coupon[key] = req.body[key].toUpperCase();
      } else if (key === "validFrom" || key === "validUntil") {
        coupon[key] = new Date(req.body[key]);
      } else {
        coupon[key] = req.body[key];
      }
    });

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating coupon",
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const coupon = await Coupon.findById(parsed.data);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting coupon",
    });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const parsed = validateCouponValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { code, orderAmount } = parsed.data;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active or has expired",
      });
    }

    // Check minimum order amount
    if (!coupon.canBeUsedForAmount(orderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount required: $${coupon.minimumOrderAmount}`,
      });
    }

    // Check user eligibility
    const userOrderCount = await Order.countDocuments({ user: userId });
    if (!coupon.canUserUse(userId, userOrderCount)) {
      return res.status(400).json({
        success: false,
        message: "You are not eligible to use this coupon",
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      data: {
        coupon: {
          id: coupon._id,
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maximumDiscount: coupon.maximumDiscount,
        },
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while validating coupon",
    });
  }
};

const updateCouponStatus = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Toggle the isActive field
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Category ${
        coupon.isActive ? "activated" : "deactivated"
      } successfully`,
      coupon: {
        _id: coupon._id,
        name: coupon.name,
        isActive: coupon.isActive,
      },
    });
  } catch (err) {
    console.error(err.message);

    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getCoupons,
  getActiveCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  updateCouponStatus,
};
