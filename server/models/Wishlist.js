const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Variant information for variable products
  variantSku: {
    type: String,
    trim: true
  },
  variantOptions: {
    type: mongoose.Schema.Types.Mixed
  }, // e.g., { "Color": "Red", "Size": "M" }
  variantId: {
    type: String
  } // Reference to the variant for tracking
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total items before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema); 