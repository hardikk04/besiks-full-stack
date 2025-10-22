const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalPrice: 0,
          totalItems: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
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
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
            name: product.name,
            image: product.images[0],
          },
        ],
      });
    } else {
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more items. Only ${product.stock} available in stock`,
          });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0],
        });
      }
    }

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Get cart count (for header display)
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    const count = cart ? cart.totalItems : 0;

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};

// Merge guest cart with user cart
exports.mergeGuestCart = async (req, res) => {
  try {
    const { guestCartItems } = req.body;

    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({
        success: false,
        message: "Guest cart items are required",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart with guest items
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    // Process each guest cart item
    for (const guestItem of guestCartItems) {
      // Handle both product object and productId string
      const productId = guestItem.product?._id || guestItem.product;
      const { quantity, price, name, image } = guestItem;

      if (!productId) {
        console.log("Skipping item without product ID:", guestItem);
        continue;
      }

      // Check if product exists and is active
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        console.log("Skipping invalid product:", productId);
        continue; // Skip invalid products
      }

      // Check if product already exists in user's cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity (add guest quantity to existing quantity)
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity <= product.stock) {
          cart.items[existingItemIndex].quantity = newQuantity;
        } else {
          // Set to maximum available stock
          cart.items[existingItemIndex].quantity = product.stock;
        }
      } else {
        // Add new item
        const finalQuantity = Math.min(quantity, product.stock);
        if (finalQuantity > 0) {
          cart.items.push({
            product: productId,
            quantity: finalQuantity,
            price: product.price,
            name: product.name,
            image: product.images[0],
          });
        }
      }
    }

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    res.status(200).json({
      success: true,
      message: "Guest cart merged successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};
