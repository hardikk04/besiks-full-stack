const Category = require("../models/Category");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const slugify = require("slugify");
const { mongooseIdValidation } = require("../validation/product/validation");
const {
  createCategoryValidation,
} = require("../validation/category/validation");
const { deleteImageFile } = require("../utils/imageCleanup");

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

// @desc    Get category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const identifier = req.params.id;
    
    // Check if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    let category;
    
    if (isObjectId) {
      category = await Category.findById(identifier);
    } else {
      // Try to find by slug
      category = await Category.findOne({ slug: identifier });
    }
    
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    
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

    // If slug is not provided, generate it from name
    let categoryData = { ...parsed.data };
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });
      
      // Ensure slug uniqueness
      let baseSlug = categoryData.slug;
      let counter = 1;
      while (await Category.findOne({ slug: categoryData.slug })) {
        categoryData.slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else if (categoryData.slug) {
      // Validate slug uniqueness if provided
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this slug already exists",
          errors: { slug: "Slug must be unique" },
        });
      }
    }

    const newCategory = new Category(categoryData);
    const category = await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists`,
        errors: { [field]: `${field} must be unique` },
      });
    }
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

    // Store old image before update
    const oldImage = category.image;

    // Handle slug generation/validation if name is being updated
    let updateData = { ...req.body };
    if (updateData.name && !updateData.slug) {
      // If name changes but slug not provided, generate new slug
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
      
      // Ensure slug uniqueness (excluding current category)
      let baseSlug = updateData.slug;
      let counter = 1;
      while (await Category.findOne({ slug: updateData.slug, _id: { $ne: category._id } })) {
        updateData.slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else if (updateData.slug) {
      // Validate slug uniqueness if provided
      const existingCategory = await Category.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: category._id } 
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this slug already exists",
          errors: { slug: "Slug must be unique" },
        });
      }
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    // Delete old image if it's being replaced or removed
    if (oldImage && (!req.body.image || oldImage !== req.body.image)) {
      await deleteImageFile(oldImage);
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists`,
        errors: { [field]: `${field} must be unique` },
      });
    }
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
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

    // Store image before deletion
    const categoryImage = category.image;

    await Category.deleteOne({ _id: req.params.id }); // instead of category.remove()
    
    // Delete category image
    if (categoryImage) {
      await deleteImageFile(categoryImage);
    }

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

// @desc    Get products by category ID or slug
// @route   GET /api/categories/:id/products or /api/products/category/:slug
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const identifier = req.params.id || req.params.slug;
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Category identifier is required",
      });
    }

    // Check if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    let category;
    
    if (isObjectId) {
      category = await Category.findById(identifier);
    } else {
      // Try to find by slug
      category = await Category.findOne({ slug: identifier });
    }
    
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

    // Build query object - use the category._id we found
    // Mongoose will handle ObjectId conversion automatically, so we can pass category._id directly
    // For array fields in Mongoose, using the ObjectId directly works correctly
    let query = {
      categories: category._id, // Mongoose handles ObjectId conversion automatically
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

    // Use Mongoose Product model which handles ObjectId type conversion automatically
    // This ensures proper matching whether category IDs are stored as ObjectIds or strings
    let products = await Product.find(query)
      .populate('categories', 'name slug')
      .populate('tags', 'name')
      .populate('reviews.user', 'name avatar')
      .lean();
    
    // Convert to plain objects and ensure consistent structure
    const populatedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      categories: product.categories || [],
      tags: product.tags || [],
      reviews: (product.reviews || []).map(review => ({
        ...review,
        user: review.user || { name: 'Unknown User' }
      }))
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
  getCategoryBySlug,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
};
