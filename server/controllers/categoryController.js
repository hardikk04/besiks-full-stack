const Category = require("../models/Category");
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
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ sucess: false, message: "Server error" });
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

    res.json({
      success: true,
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
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(500).send({ success: false, message: "Server error" });
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
    res.json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ success: false, message: "Server error" });
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

    res.json({
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
    res.json({ success: true, message: "Category removed" });
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

    res.json({
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

module.exports = {
  getCategories,
  searchCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
};
