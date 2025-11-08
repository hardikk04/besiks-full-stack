const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;
    

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    // Validate orderItems structure - should only contain product and quantity
    for (const item of orderItems) {
      if (!item.product || !item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Each order item must have product and quantity" });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res
          .status(400)
          .json({ success: false, message: "Quantity must be a positive number" });
      }
    }

    // Fetch all products and build orderItems with product details from database
    const orderItemsWithDetails = [];
    let itemsPrice = 0;
    let taxPrice = 0;
    let shippingPrice = 0;
    let couponDiscount = 0;

    // Fetch products and validate
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product with ID ${item.product} not found` });
      }

      if (!product.isActive) {
        return res
          .status(400)
          .json({ success: false, message: `Product ${product.name} is not available` });
      }

      // Get product price (for simple products) or handle variable products
      let productPrice = 0;
      let selectedVariant = null;
      
      if (product.productType === 'simple') {
        productPrice = product.price;
        
        // Check stock availability for simple products
        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ 
              success: false, 
              message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
            });
        }
      } else if (product.productType === 'variable') {
        // For variable products, we need variant information
        // If variantId is provided, use that variant's price
        if (item.variantId) {
          selectedVariant = product.variants.id(item.variantId);
          if (!selectedVariant) {
            return res
              .status(404)
              .json({ success: false, message: `Variant with ID ${item.variantId} not found` });
          }
          if (!selectedVariant.isActive) {
            return res
              .status(400)
              .json({ success: false, message: `Variant for ${product.name} is not available` });
          }
          productPrice = selectedVariant.price;
          
          // Check variant stock
          if (selectedVariant.stock < item.quantity) {
            return res
              .status(400)
              .json({ 
                success: false, 
                message: `Insufficient stock for ${product.name} variant. Available: ${selectedVariant.stock}, Requested: ${item.quantity}` 
              });
          }
        } else {
          return res
            .status(400)
            .json({ success: false, message: `Variant ID is required for variable product ${product.name}` });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: `Invalid product type for ${product.name}` });
      }

      // Build order item with details from database
      const orderItem = {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: productPrice, // Use price from database, not from frontend
        image: product.images && product.images.length > 0 
          ? product.images[product.featuredImageIndex || 0] 
          : "/placeholder.jpg"
      };

      // Add variant info if it's a variable product
      if (selectedVariant) {
        orderItem.variantId = selectedVariant._id.toString();
        orderItem.variantOptions = selectedVariant.options;
        // Use variant image if available
        if (selectedVariant.images && selectedVariant.images.length > 0) {
          orderItem.image = selectedVariant.images[selectedVariant.featuredImageIndex || 0];
        }
      }

      orderItemsWithDetails.push(orderItem);
      itemsPrice += productPrice * item.quantity;
    }

    // Apply coupon discount if provided (calculate before tax to match checkout logic)
    let discountedSubtotal = itemsPrice;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (coupon && coupon.isValid() && coupon.canBeUsedForAmount(itemsPrice)) {
        // Check user eligibility
        const userOrderCount = await Order.countDocuments({
          user: req.user.id,
        });
        if (coupon.canUserUse(req.user.id, userOrderCount)) {
          couponDiscount = coupon.calculateDiscount(itemsPrice);
          discountedSubtotal = Math.max(0, itemsPrice - couponDiscount);

          // Increment coupon usage
          await coupon.incrementUsage();
        }
      }
    }

    // Calculate tax per product using its tax percent, on discounted amount (matching checkout logic)
    for (const orderItem of orderItemsWithDetails) {
      const product = await Product.findById(orderItem.product);
      if (product) {
        const taxPercent = parseFloat(product.tax || "0");
        if (!isNaN(taxPercent) && taxPercent > 0) {
          const lineAmount = orderItem.price * orderItem.quantity;
          // Proportionally reduce tax base if coupon applied (matching checkout logic)
          const proportion = itemsPrice > 0 ? lineAmount / itemsPrice : 0;
          const lineDiscountedBase = discountedSubtotal * proportion;
          taxPrice += (lineDiscountedBase * taxPercent) / 100;
        }
      }
    }

    // Calculate shipping based on discounted subtotal (matching checkout logic)
    shippingPrice = discountedSubtotal > 100 ? 0 : 10;

    const totalPrice = discountedSubtotal + taxPrice + shippingPrice;

    const order = new Order({
      user: req.user.id,
      orderItems: orderItemsWithDetails,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      couponDiscount,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name price image");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Make sure user owns order or is admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    res.status(201).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "orderItems.product",
      "name price image"
    );
    res.status(201).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name")
      .populate("orderItems.product", "name price image");
    res.status(201).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "delivered";

    const updatedOrder = await order.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Order delivered successfully",
        data: updatedOrder,
      });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Confirm payment for order
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpaySignature, paymentMethod } = req.body;
    const orderId = req.params.id;

    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and signature are required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Update payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod || "razorpay";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentResult = {
      id: razorpayPaymentId,
      status: "completed",
      update_time: new Date().toISOString(),
      method: paymentMethod || "razorpay",
    };
    order.status = "processing"; // Move to processing after payment

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming payment",
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered,
  confirmPayment,
};
