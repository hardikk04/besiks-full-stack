const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images stock isActive productType variantOptions variants slug categories tax",
      populate: {
        path: "categories",
        select: "name"
      }
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart not found",
        data: {
          items: [],
          totalPrice: 0,
          totalItems: 0,
        },
      });
    }

    // Clean up items where product no longer exists (safety net)
    const validItems = cart.items.filter(item => item.product !== null && item.product !== undefined);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      // Recalculate totals after cleanup
      cart.totalItems = validItems.reduce((total, item) => total + item.quantity, 0);
      cart.totalPrice = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
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
    const { productId, quantity = 1, variantSku, variantOptions, variantId } = req.body;

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

    // For variable products, validate variant
    if (product.productType === "variable") {
      if (!variantOptions || Object.keys(variantOptions).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select a variation first",
        });
      }

      // Find the variant by matching options
      const variant = product.variants.find(v => {
        if (!v.options) return false;
        // Match by options object
        const variantOptionsMatch = Object.keys(variantOptions).every(
          key => v.options[key] === variantOptions[key]
        ) && Object.keys(v.options).length === Object.keys(variantOptions).length;
        
        // Also check SKU or variantId if provided
        if (variantSku && v.sku === variantSku) return true;
        if (variantId && v._id?.toString() === variantId) return true;
        
        return variantOptionsMatch;
      });

      if (!variant || variant.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "Selected variation is not available",
        });
      }

      // Check variant stock
      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} items available in stock for this variation`,
        });
      }

      // Use variant price and stock
      const itemPrice = variant.price;
      const itemStock = variant.stock;
      const itemImage = variant.image || product.images[0];

      let cart = await Cart.findOne({ user: req.user.id });

      if (!cart) {
        // Create new cart
        cart = new Cart({
          user: req.user.id,
          items: [
            {
              product: productId,
              quantity,
              price: itemPrice,
              name: product.name,
              image: itemImage,
              variantSku: variant.sku || variantSku,
              variantOptions: variant.options,
              variantId: variant._id?.toString() || variantId,
            },
          ],
        });
      } else {
        // For variable products, check if same variant already exists
        const existingItemIndex = cart.items.findIndex(
          (item) => {
            if (item.product.toString() === productId) {
              // For variable products, match by variant SKU or options
              if (product.productType === "variable") {
                return item.variantSku === (variant.sku || variantSku) ||
                       JSON.stringify(item.variantOptions) === JSON.stringify(variant.options);
              }
              // For simple products, just match product ID
              return true;
            }
            return false;
          }
        );

        if (existingItemIndex > -1) {
          // Update quantity
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;
          if (newQuantity > itemStock) {
            return res.status(400).json({
              success: false,
              message: `Cannot add more items. Only ${itemStock} available in stock for this variation`,
            });
          }
          cart.items[existingItemIndex].quantity = newQuantity;
        } else {
          // Add new item
          cart.items.push({
            product: productId,
            quantity,
            price: itemPrice,
            name: product.name,
            image: itemImage,
            variantSku: variant.sku || variantSku,
            variantOptions: variant.options,
            variantId: variant._id?.toString() || variantId,
          });
        }
      }

      await cart.save();

      // Populate product details
      await cart.populate({
        path: "items.product",
        select: "name price images stock isActive productType variantOptions variants slug categories tax",
        populate: {
          path: "categories",
          select: "name"
        }
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    }

    // Handle simple products
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
        (item) => item.product.toString() === productId && !item.variantSku
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
      select: "name price images stock isActive productType variantOptions variants slug categories tax",
      populate: {
        path: "categories",
        select: "name"
      }
    });

    res.status(201).json({
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
    const { productId, quantity, variantSku, variantOptions } = req.body;

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

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the cart item - for variable products, match by variant
    const itemIndex = cart.items.findIndex((item) => {
      if (item.product.toString() === productId) {
        // For variable products, match by variant
        if (product.productType === "variable" && (variantOptions || item.variantOptions)) {
          const itemVariantKey = item.variantSku || JSON.stringify(item.variantOptions || {});
          const requestVariantKey = variantSku || JSON.stringify(variantOptions || {});
          return itemVariantKey === requestVariantKey;
        }
        // For simple products, just match product ID (and no variant)
        return !item.variantSku;
      }
      return false;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check stock - for variable products, check variant stock
    let availableStock = product.stock;
    if (product.productType === "variable" && cart.items[itemIndex].variantOptions) {
      const variant = product.variants.find(v => {
        if (!v.options) return false;
        const itemOptions = cart.items[itemIndex].variantOptions;
        return Object.keys(itemOptions).every(
          key => v.options[key] === itemOptions[key]
        ) && Object.keys(v.options).length === Object.keys(itemOptions).length;
      });
      if (variant) {
        availableStock = variant.stock;
      }
    }

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} items available in stock`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive productType variantOptions variants slug categories tax",
      populate: {
        path: "categories",
        select: "name"
      }
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
    const { variantSku, variantOptions, variantId } = req.query; // Optional variant identifier

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item to remove (by productId and optionally by variant)
    const itemIndex = cart.items.findIndex(item => {
      if (item.product.toString() !== productId) return false;
      
      // If variant identifier provided, match it
      if (variantId) {
        return item.variantId === variantId;
      }
      if (variantSku) {
        return item.variantSku === variantSku;
      }
      if (variantOptions) {
        try {
          const optionsObj = typeof variantOptions === 'string' ? JSON.parse(variantOptions) : variantOptions;
          const itemOptionsStr = item.variantOptions ? JSON.stringify(item.variantOptions) : '';
          const queryOptionsStr = JSON.stringify(optionsObj);
          return itemOptionsStr === queryOptionsStr;
        } catch (e) {
          return false;
        }
      }
      
      // If no variant identifier, remove first match (for simple products)
      return !item.variantSku;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock isActive productType variantOptions variants slug categories tax",
      populate: {
        path: "categories",
        select: "name"
      }
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
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "_id"
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart count fetched successfully",
        data: { count: 0 },
      });
    }

    // Filter out items with null products and calculate accurate count
    const validItems = cart.items.filter(item => item.product !== null && item.product !== undefined);
    const count = validItems.reduce((total, item) => total + item.quantity, 0);

    // If count differs from stored totalItems, update it
    if (count !== cart.totalItems && validItems.length !== cart.items.length) {
      cart.items = validItems;
      cart.totalItems = count;
      cart.totalPrice = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart count fetched successfully",
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
      select: "name price images stock isActive productType variantOptions variants slug categories tax",
      populate: {
        path: "categories",
        select: "name"
      }
    });

    res.status(201).json({
      success: true,
      message: "Guest cart merged successfully",
      data: cart,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, data: "Server error" });
  }
};
