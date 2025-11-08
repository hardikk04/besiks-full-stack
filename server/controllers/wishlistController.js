const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { mongooseIdValidation } = require("../validation/product/validation");

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images stock isActive rating numReviews productType variantOptions variants",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          items: [],
          totalItems: 0,
        },
      });
    }

    // Clean up items where product no longer exists (safety net)
    const validItems = wishlist.items.filter(item => item.product !== null && item.product !== undefined);
    if (validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      // Recalculate totalItems after cleanup
      wishlist.totalItems = validItems.length;
      await wishlist.save();
    }

    // Map items to products for backward compatibility
    const products = wishlist.items
      .filter(item => item.product !== null)
      .map(item => ({
        ...item.product.toObject(),
        variantSku: item.variantSku,
        variantOptions: item.variantOptions,
        variantId: item.variantId,
      }));

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: {
        ...wishlist.toObject(),
        products, // For backward compatibility
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, variantSku, variantOptions, variantId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate MongoDB ID format
    const parsed = mongooseIdValidation.safeParse(productId);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // For variable products, validate variant selection
    if (product.productType === "variable") {
      if (!variantOptions || Object.keys(variantOptions).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Variant selection is required for variable products",
        });
      }
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user.id,
        items: [{
          product: productId,
          variantSku: variantSku || null,
          variantOptions: variantOptions || null,
          variantId: variantId || null,
        }],
      });
    } else {
      // Check if product (with same variant) already exists in wishlist
      const itemExists = wishlist.items.some(item => {
        if (item.product.toString() !== productId) return false;
        
        // For variable products, check variant match
        if (product.productType === "variable") {
          const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
          const newVariantKey = variantSku || JSON.stringify(variantOptions || {});
          return itemVariantKey === newVariantKey;
        }
        
        // For simple products, just check product ID
        return !item.variantSku;
      });

      if (itemExists) {
        return res.status(400).json({
          success: false,
          message: "Product already exists in wishlist",
        });
      }

      // Add product to wishlist
      wishlist.items.push({
        product: productId,
        variantSku: variantSku || null,
        variantOptions: variantOptions || null,
        variantId: variantId || null,
      });
    }

    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: "items.product",
      select: "name price images stock isActive rating numReviews productType variantOptions variants",
    });

    // Map items to products for backward compatibility
    const products = wishlist.items.map(item => ({
      ...item.product.toObject(),
      variantSku: item.variantSku,
      variantOptions: item.variantOptions,
      variantId: item.variantId,
    }));

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: {
        ...wishlist.toObject(),
        products, // For backward compatibility
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId, variantSku } = req.query; // Optional variant identifier

    // Validate MongoDB ID format
    const parsed = mongooseIdValidation.safeParse(productId);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Find item to remove (by productId and optionally by variant)
    const itemIndex = wishlist.items.findIndex(item => {
      if (item.product.toString() !== productId) return false;
      
      // If variant identifier provided, match it
      if (variantId) {
        return item.variantId === variantId;
      }
      if (variantSku) {
        return item.variantSku === variantSku;
      }
      
      // If no variant identifier, remove first match (for simple products)
      return true;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove item from wishlist
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: "items.product",
      select: "name price images stock isActive rating numReviews productType variantOptions variants",
    });

    // Map items to products for backward compatibility
    const products = wishlist.items.map(item => ({
      ...item.product.toObject(),
      variantSku: item.variantSku,
      variantOptions: item.variantOptions,
      variantId: item.variantId,
    }));

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: {
        ...wishlist.toObject(),
        products, // For backward compatibility
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ID format
    const parsed = mongooseIdValidation.safeParse(productId);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
        data: { isInWishlist: false },
      });
    }

    const isInWishlist = wishlist.items.some(item => item.product.toString() === productId);

    res.status(200).json({
      success: true,
      message: "Wishlist status checked successfully",
      data: { isInWishlist },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get wishlist count (for header display)
exports.getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "_id"
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist count fetched successfully",
        data: { count: 0 },
      });
    }

    // Filter out items with null products and calculate accurate count
    const validItems = wishlist.items.filter(item => item.product !== null && item.product !== undefined);
    const count = validItems.length;

    // If count differs from stored totalItems, update it
    if (count !== wishlist.totalItems && validItems.length !== wishlist.items.length) {
      wishlist.items = validItems;
      wishlist.totalItems = count;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Wishlist count fetched successfully",
      data: { count },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Move wishlist item to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate MongoDB ID format
    const parsed = mongooseIdValidation.safeParse(productId);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    // Check if product exists in wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist || !wishlist.items.some(item => item.product.toString() === productId)) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // Check stock availability
    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Remove from wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );
    await wishlist.save();

    res.status(201).json({
      success: true,
      message:
        "Product moved to cart successfully. Please add it to your cart.",
      data: { productId },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Merge guest wishlist with user wishlist
exports.mergeGuestWishlist = async (req, res) => {
  try {
    const { guestWishlistProducts } = req.body;

    if (!guestWishlistProducts || !Array.isArray(guestWishlistProducts)) {
      return res.status(400).json({
        success: false,
        message: "Guest wishlist products are required",
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user.id,
        items: [],
      });
    }

    // Process each guest wishlist product
    for (const guestProduct of guestWishlistProducts) {
      // Handle both product object and productId string
      const productId = guestProduct._id || guestProduct;

      if (!productId) {
        console.log("Skipping product without ID:", guestProduct);
        continue;
      }

      // Check if product exists and is active
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        console.log("Skipping invalid product:", productId);
        continue; // Skip invalid products
      }

      // Extract variant information if present
      const variantSku = guestProduct.variantSku || null;
      const variantOptions = guestProduct.variantOptions || null;
      const variantId = guestProduct.variantId || null;

      // Check if product (with same variant) already exists in user's wishlist
      const itemExists = wishlist.items.some(item => {
        if (item.product.toString() !== productId) return false;
        
        // For variable products, check variant match
        if (product.productType === "variable") {
          const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
          const newVariantKey = variantSku || JSON.stringify(variantOptions || {});
          return itemVariantKey === newVariantKey;
        }
        
        // For simple products, just check product ID
        return !item.variantSku;
      });

      if (!itemExists) {
        // Add new product to wishlist
        wishlist.items.push({
          product: productId,
          variantSku,
          variantOptions,
          variantId,
        });
      }
    }

    await wishlist.save();

    // Populate product details
    await wishlist.populate({
      path: "items.product",
      select: "name price images stock isActive rating numReviews productType variantOptions variants",
    });

    // Map items to products for backward compatibility
    const products = wishlist.items.map(item => ({
      ...item.product.toObject(),
      variantSku: item.variantSku,
      variantOptions: item.variantOptions,
      variantId: item.variantId,
    }));

    res.status(201).json({
      success: true,
      message: "Guest wishlist merged successfully",
      data: {
        ...wishlist.toObject(),
        products, // For backward compatibility
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
