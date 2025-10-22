const Product = require("../models/Product");
const Tag = require("../models/Tag");
const Category = require("../models/Category");
const Order = require("../models/Order");
const {
  getAllProductValidation,
  createProductValidation,
  mongooseIdValidation,
} = require("../validation/product/validation");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const parsed = getAllProductValidation.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      page = 1,
      limit = 10,
      categories,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = parsed.data;

    let query = {};

    if (categories) {
      query.categories = categories;
    }

    if (search) {
      // Create an array to hold all search conditions
      const searchConditions = [];

      // Add text search for product fields (name, description, tags)
      searchConditions.push({ $text: { $search: search } });

      // Search for category by name and add to search conditions
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      if (matchingCategories.length > 0) {
        searchConditions.push({
          categories: { $in: matchingCategories.map((cat) => cat._id) },
        });
      }

      // Use $or to search in either product fields or category names
      query.$or = searchConditions;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("categories", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("categories", "name")
      .populate("reviews.user", "name avatar");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ sucess: true, message: "Product found successfully", product });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(500).send("Server error");
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
  try {
    const parsed = createProductValidation.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const checkProduct = await Product.findOne({ sku: parsed.data.sku });

    if (checkProduct) {
      return res.status(400).json({
        success: false,
        message: "SKU MUST UNIQUE",
      });
    }

    const { tags } = parsed.data;
    let tagIds = [];
    if (tags && tags.length > 0) {
      for (let tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({ name: tagName });
        }
        tagIds.push(tag._id);
      }
    }

    const newProduct = new Product({ ...parsed.data, tags: tagIds });
    const product = await newProduct.save();
    res.json({
      success: true,
      message: `Product created`,
      product,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ success: true, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: false, message: "Product removed successfully" });
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

// @desc    Toggle product active status
// @route   PUT /api/products/:id/status
// @access  Private (Admin only)
const updateProductStatus = async (req, res) => {
  try {
    const parsed = mongooseIdValidation.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.flatten(),
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Toggle the isActive field
    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${
        product.isActive ? "activated" : "deactivated"
      } successfully`,
      product: {
        _id: product._id,
        name: product.name,
        isActive: product.isActive,
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

// @desc    Search products by SKU, name, or category
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { query, type = "all", page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = query.trim();
    let filter = {};

    // Build search filter based on type
    switch (type.toLowerCase()) {
      case "sku":
        filter.sku = { $regex: searchQuery, $options: "i" };
        break;
      case "name":
        filter.name = { $regex: searchQuery, $options: "i" };
        break;
      case "category":
        // First find categories that match the search query
        const categories = await require("../models/Category")
          .find({
            name: { $regex: searchQuery, $options: "i" },
          })
          .select("_id");
        const categoryIds = categories.map((cat) => cat._id);
        filter.categories = { $in: categoryIds };
        break;
      case "all":
      default:
        // Search in SKU, name, and category
        const allCategories = await require("../models/Category")
          .find({
            name: { $regex: searchQuery, $options: "i" },
          })
          .select("_id");
        const allCategoryIds = allCategories.map((cat) => cat._id);

        filter.$or = [
          { sku: { $regex: searchQuery, $options: "i" } },
          { name: { $regex: searchQuery, $options: "i" } },
          { categories: { $in: allCategoryIds } },
        ];
        break;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute search with pagination
    const products = await Product.find(filter)
      .populate("categories", "name")
      .populate("tags", "name")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .exec();

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.json({
      success: true,
      message: `Found ${totalProducts} product(s) matching your search`,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        searchInfo: {
          query: searchQuery,
          type: type,
          resultsCount: products.length,
        },
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error during search",
    });
  }
};

// @desc    Get newest products
// @route   GET /api/products/new
// @access  Public
const getNewProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({})
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    res.json({ success: true, products });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get recent purchases for the authenticated user, fallback to products
// @route   GET /api/products/recent-purchases
// @access  Private (requires auth cookie)
const getRecentPurchases = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Find recent orders for this user
    const recentOrders = await Order.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderItems")
      .lean();

    let productIds = [];
    if (recentOrders && recentOrders.length > 0) {
      for (const order of recentOrders) {
        for (const item of order.orderItems || []) {
          if (item.product) {
            productIds.push(item.product.toString());
          }
        }
      }
      // Deduplicate while preserving order
      const seen = new Set();
      productIds = productIds.filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    let products;
    if (productIds.length > 0) {
      products = await Product.find({ _id: { $in: productIds } })
        .populate("categories", "name")
        .lean();
      // Sort according to order of productIds (recent first)
      const orderMap = new Map(productIds.map((id, idx) => [id, idx]));
      products.sort((a, b) => (orderMap.get(a._id.toString()) ?? 0) - (orderMap.get(b._id.toString()) ?? 0));
      products = products.slice(0, limit);
    } else {
      // Fallback: normal products (e.g., newest)
      products = await Product.find({})
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    return res.json({ success: true, products });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  searchProducts,
  getNewProducts,
  getRecentPurchases,
};
