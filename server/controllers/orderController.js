const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate prices
    let itemsPrice = 0;
    let taxPrice = 0;
    let shippingPrice = 0;
    let couponDiscount = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        itemsPrice += product.price * item.quantity;
      }
    }

    // Calculate tax (example: 10%)
    taxPrice = itemsPrice * 0.1;
    
    // Calculate shipping (example: $10 for orders under $100)
    shippingPrice = itemsPrice > 100 ? 0 : 10;

    let totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (coupon && coupon.isValid() && coupon.canBeUsedForAmount(itemsPrice)) {
        // Check user eligibility
        const userOrderCount = await Order.countDocuments({ user: req.user.id });
        if (coupon.canUserUse(req.user.id, userOrderCount)) {
          couponDiscount = coupon.calculateDiscount(itemsPrice);
          totalPrice = Math.max(0, totalPrice - couponDiscount);
          
          // Increment coupon usage
          await coupon.incrementUsage();
        }
      }
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      couponDiscount,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user owns order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name price image');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .populate('orderItems.product', 'name price image');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
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
        message: 'Payment ID and signature are required'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Update payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod || 'razorpay';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentResult = {
      id: razorpayPaymentId,
      status: 'completed',
      update_time: new Date().toISOString(),
      method: paymentMethod || 'razorpay'
    };
    order.status = 'processing'; // Move to processing after payment

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered,
  confirmPayment
}; 