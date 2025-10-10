const express = require("express");
const {
  getCategories,
  searchCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} = require("../controllers/categoryController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", getCategories);

// @route   GET /api/categories/search
// @desc    Search categories by name
// @access  Private (Admin only)
router.get("/search", searchCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get("/:id", getCategoryById);

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin only)
router.post(
  "/",
  auth.protect,
  auth.admin,
  upload.single("image"),
  createCategory
);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put("/:id", auth.protect, auth.admin, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete("/:id", auth.protect, auth.admin, deleteCategory);

// @route   PUT /api/category/:id/status
// @desc    Update category active status
// @access  Private (Admin only)
router.put("/:id/status", auth.protect, auth.admin, updateCategoryStatus);

module.exports = router;
