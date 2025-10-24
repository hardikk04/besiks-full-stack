const Category = require("../models/Category");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { mongooseIdValidation } = require("../validation/product/validation");
const {
  createCategoryValidation,
} = require("../validation/category/validation");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("sortOrder");
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

// @desc    Get featured categories (active categories)
// @route   GET /api/categories/featured
// @access  Public
const getFeaturedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort(
      "sortOrder"
    );
    res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

// @desc    Search categories by name
// @route   GET /api/categories/search
// @access  Private (Admin only)
const searchCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const categories = await Category.find(query)
      .populate("parent", "name")
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCategories: count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const category = await Category.findById(parsed.data);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  try {
    const parsed = createCategoryValidation.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const newCategory = new Category(parsed.data);
    const category = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    let category = await Category.findById(parsed.data);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: false,
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).json({ success: false, message: "Category not found" });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const category = await Category.findById(parsed.data);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    await Category.deleteOne({ _id: req.params.id }); // instead of category.remove()
    res.status(200).json({ success: true, message: "Category removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).json({ success: false, message: "Category not found" });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Toggle the isActive field
    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      category: {
        _id: category._id,
        name: category.name,
        isActive: category.isActive,
      },
    });
  } catch (err) {
    console.error(err.message);

    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get products by category ID
// @route   GET /api/categories/:id/products
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    // Check if category exists
    const category = await Category.findById(parsed.data);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Get query parameters for filtering and sorting
    const {
      sort = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
      isActive = true,
    } = req.query;

    // Build query object
    let query = {
      categories: parsed.data.toString(),
      isActive: isActive === "true" || isActive === true,
    };

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Execute query to get ALL products in the category
    // Use native MongoDB driver to handle string category IDs
    const db = req.app.locals.db || require('mongoose').connection.db;
    const products = await db.collection('products').find(query).toArray();
    
    // Populate categories, tags, and reviews manually since we're using native driver
    const populatedProducts = await Promise.all(products.map(async (product) => {
      // Populate categories
      const categoryIds = product.categories.map(id => new mongoose.Types.ObjectId(id));
      const categories = await Category.find({ _id: { $in: categoryIds } }).select('name');
      
      // Populate tags if they exist
      let tags = [];
      if (product.tags && product.tags.length > 0) {
        const tagIds = product.tags.map(id => new mongoose.Types.ObjectId(id));
        tags = await require('../models/Tag').find({ _id: { $in: tagIds } }).select('name');
      }
      
      // Populate reviews if they exist
      let populatedReviews = [];
      if (product.reviews && product.reviews.length > 0) {
        const User = require('../models/User');
        const userIds = product.reviews.map(review => new mongoose.Types.ObjectId(review.user));
        const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
        
        // Create a map of user data for quick lookup
        const userMap = new Map();
        users.forEach(user => userMap.set(user._id.toString(), user));
        
        // Populate reviews with user data
        populatedReviews = product.reviews.map(review => ({
          ...review,
          user: userMap.get(review.user.toString()) || { _id: review.user, name: 'Unknown User' }
        }));
      }
      
      return {
        ...product,
        categories,
        tags,
        reviews: populatedReviews
      };
    }));
    
    // Sort the populated products
    const sortedProducts = populatedProducts.sort((a, b) => {
      const aValue = a[sort];
      const bValue = b[sort];
      if (sortOrder === -1) {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    res.status(200).json({
      success: true,
      products: sortedProducts,
      message: "Products fetched successfully",
      totalProducts: sortedProducts.length,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
      },
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getCategories,
  getFeaturedCategories,
  searchCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
};
