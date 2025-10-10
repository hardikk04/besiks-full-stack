const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products',
        select: 'name price images stock isActive rating numReviews'
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          totalItems: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user.id,
        products: [productId]
      });
    } else {
      // Check if product already exists in wishlist
      const productExists = wishlist.products.includes(productId);
      
      if (productExists) {
        return res.status(400).json({
          success: false,
          message: 'Product already exists in wishlist'
        });
      }

      // Add product to wishlist
      wishlist.products.push(productId);
    }

    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: 'products',
      select: 'name price images stock isActive rating numReviews'
    });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: wishlist
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Check if product exists in wishlist
    const productIndex = wishlist.products.indexOf(productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: 'products',
      select: 'name price images stock isActive rating numReviews'
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: wishlist
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: wishlist
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { isInWishlist: false }
      });
    }

    const isInWishlist = wishlist.products.includes(productId);

    res.status(200).json({
      success: true,
      data: { isInWishlist }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get wishlist count (for header display)
exports.getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    const count = wishlist ? wishlist.totalItems : 0;

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Move wishlist item to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists in wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist || !wishlist.products.includes(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check stock availability
    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product moved to cart successfully. Please add it to your cart.',
      data: { productId }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 