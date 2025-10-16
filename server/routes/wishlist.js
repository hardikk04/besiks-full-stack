const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkWishlistStatus);

// Get wishlist count (for header display)
router.get('/count', wishlistController.getWishlistCount);

// Move wishlist item to cart
router.post('/move-to-cart/:productId', wishlistController.moveToCart);

// Merge guest wishlist with user wishlist
router.post('/merge-guest-wishlist', wishlistController.mergeGuestWishlist);

module.exports = router; 