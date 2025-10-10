const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot be more than 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maximumDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFirstTimeUser: {
    type: Boolean,
    default: false
  },
  isNewUser: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil && 
         (this.usageLimit === null || this.usageCount < this.usageLimit);
};

// Check if coupon can be used for given order amount
couponSchema.methods.canBeUsedForAmount = function(orderAmount) {
  return orderAmount >= this.minimumOrderAmount;
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }
  
  // Apply maximum discount limit if set
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }
  
  return Math.min(discount, orderAmount); // Discount cannot exceed order amount
};

// Increment usage count
couponSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Check if user can use this coupon
couponSchema.methods.canUserUse = function(userId, userOrderCount) {
  if (this.isFirstTimeUser && userOrderCount > 0) {
    return false;
  }
  if (this.isNewUser && userOrderCount > 1) {
    return false;
  }
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema); 