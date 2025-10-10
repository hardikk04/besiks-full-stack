const express = require("express");
const { body } = require("express-validator");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  searchProducts,
  updateBulkProductStatus,
} = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", getProducts);

// @route   GET /api/products/search
// @desc    Search products by SKU, name, or category
// @access  Public
router.get("/search", searchProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get("/:id", getProductById);

// @route   POST /api/products
// @desc    Create a product
// @access  Private (Admin only)
router.post("/", auth.protect, auth.admin, createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put("/:id", auth.protect, auth.admin, updateProduct);

// @route   PUT /api/products/:id/status
// @desc    Update product active status
// @access  Private (Admin only)
router.put("/:id/status", auth.protect, auth.admin, updateProductStatus);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete(
  "/:id",
  auth.protect,
  auth.admin,
  deleteProduct
);

module.exports = router;