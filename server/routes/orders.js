const express = require('express');
const { 
  createOrder, 
  getOrderById, 
  getMyOrders, 
  getAllOrders, 
  updateOrderToDelivered,
  confirmPayment
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id/confirm-payment
// @desc    Confirm payment for order
// @access  Private
router.put('/:id/confirm-payment', protect, confirmPayment);

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/', protect, admin, getAllOrders);

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

module.exports = router; 