const Product = require("../models/Product");
const Tag = require("../models/Tag");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const mongoose = require("mongoose");
const slugify = require("slugify");
const {
  getAllProductValidation,
  createProductValidation,
  mongooseIdValidation,
} = require("../validation/product/validation");
const { deleteImageFiles, findDeletedImages } = require("../utils/imageCleanup");

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

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
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

// @desc    Get product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const identifier = req.params.id;
    
    // Check if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    let product;
    
    if (isObjectId) {
      product = await Product.findById(identifier)
        .populate("categories", "name slug")
        .populate("tags", "name")
        .populate("reviews.user", "name avatar");
    } else {
      // Try to find by slug
      product = await Product.findOne({ slug: identifier })
        .populate("categories", "name slug")
        .populate("tags", "name")
        .populate("reviews.user", "name avatar");
    }
    
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product found successfully", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate("categories", "name slug")
      .populate("tags", "name")
      .populate("reviews.user", "name avatar");
    
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    
    res.status(200).json({
      success: true,
      message: "Product found successfully",
      product,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
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

    // Check SKU uniqueness for simple products or base SKU
    // Only check if SKU is provided and not empty
    if (parsed.data.sku && parsed.data.sku.trim() !== "") {
      const skuToCheck = parsed.data.sku.trim();
      const checkProduct = await Product.findOne({ sku: skuToCheck });
      if (checkProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
      
      // Also check if the SKU exists in any variant of any product
      const checkVariantProduct = await Product.findOne({
        "variants.sku": skuToCheck
      });
      if (checkVariantProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
    }

    // Check variant SKU uniqueness for variable products
    if (parsed.data.productType === "variable" && parsed.data.variants) {
      const variantSkus = parsed.data.variants
        .map((v) => v.sku)
        .filter((sku) => sku && sku.trim() !== "");
      
      if (variantSkus.length > 0) {
        // Check if any variant SKU matches the simple product SKU
        if (parsed.data.sku && parsed.data.sku.trim() !== "") {
          const simpleSku = parsed.data.sku.trim();
          if (variantSkus.includes(simpleSku)) {
            return res.status(400).json({
              success: false,
              message: "Variant SKU cannot match product SKU",
              errors: { variants: "Variant SKUs must be unique and different from product SKU" },
            });
          }
        }
        
        // Check for duplicate SKUs within variants
        const duplicateSkus = variantSkus.filter((sku, index) => 
          variantSkus.indexOf(sku) !== index && sku.trim() !== ""
        );
        if (duplicateSkus.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Duplicate SKUs found within variants",
            errors: { variants: "Each variant must have a unique SKU" },
          });
        }
        
        // Check if any variant SKU already exists in any product
        const existingProducts = await Product.find({
          $or: [
            { sku: { $in: variantSkus } },
            { "variants.sku": { $in: variantSkus } }
          ]
        });
        
        if (existingProducts.length > 0) {
          return res.status(400).json({
            success: false,
            message: "One or more variant SKUs already exist",
            errors: { variants: "Variant SKUs must be unique" },
          });
        }
      }
    }

    // Handle slug generation/validation
    let productData = { ...parsed.data };
    if (!productData.slug && productData.name) {
      // If slug is not provided, generate it from name
      productData.slug = slugify(productData.name, { lower: true, strict: true });
      
      // Ensure slug uniqueness
      let baseSlug = productData.slug;
      let counter = 1;
      while (await Product.findOne({ slug: productData.slug })) {
        productData.slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else if (productData.slug) {
      // Validate slug uniqueness if provided
      const existingProduct = await Product.findOne({ slug: productData.slug });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "A product with this slug already exists",
          errors: { slug: "Slug must be unique" },
        });
      }
    }

    const { tags, productType } = productData;
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

    // Set default productType if not provided
    if (!productType) {
      productData.productType = "simple";
    }

    // For variable products, ensure variants are properly structured
    if (productData.productType === "variable" && productData.variants) {
      // Ensure all variants have required fields
      productData.variants = productData.variants.map((variant) => {
        // Handle backward compatibility: convert old 'image' (singular) to 'images' (array)
        let variantImages = variant.images || [];
        if (variant.image && !variant.images) {
          // If old 'image' field exists but 'images' doesn't, convert it
          variantImages = [variant.image];
        }
        // Ensure images is an array
        if (!Array.isArray(variantImages)) {
          variantImages = variantImages ? [variantImages] : [];
        }
        
        // Create new variant object, explicitly removing old 'image' field
        const { image, ...variantWithoutImage } = variant;
        
        return {
          ...variantWithoutImage,
          images: variantImages,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
        };
      });
    }

    // Clean up productData - remove empty SKU for variable products
    if (productData.productType === "variable" && (!productData.sku || productData.sku.trim() === "")) {
      delete productData.sku; // Remove empty SKU to avoid unique constraint issues
    }

    // Trim SKU if provided
    if (productData.sku) {
      productData.sku = productData.sku.trim();
      // Remove SKU if it's empty after trimming
      if (productData.sku === "") {
        delete productData.sku;
      }
    }

    const newProduct = new Product({ ...productData, tags: tagIds });
    const product = await newProduct.save();
    res.status(201).json({
      success: true,
      message: `Product created successfully`,
      product,
    });
  } catch (err) {
    console.error("Product creation error:", err);
    // Check for duplicate key error (MongoDB unique constraint)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'sku' ? 'SKU' : field === 'slug' ? 'Slug' : field} already exists`,
        errors: { [field]: `${field} must be unique` },
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
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

    // Validate the update data using the same validation schema
    const validationParsed = createProductValidation.safeParse(req.body);
    if (!validationParsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationParsed.error.flatten().fieldErrors,
      });
    }

    // Store old images before update
    const oldImages = product.images || [];

    // Handle slug generation/validation if name is being updated
    let updateData = { ...req.body };

    // Determine product type (use updateData if provided, otherwise use existing)
    const currentProductType = updateData.productType || product.productType || "simple";
    
    // Check SKU uniqueness only for simple products or if base SKU is being updated
    // For variable products, SKU is managed at variant level, so base SKU is optional
    if (currentProductType === "simple" && updateData.sku && updateData.sku !== product.sku) {
      const checkProduct = await Product.findOne({ 
        sku: updateData.sku,
        _id: { $ne: product._id }
      });
      if (checkProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
      
      // Also check if the SKU exists in any variant of any product
      const checkVariantProduct = await Product.findOne({
        _id: { $ne: product._id },
        "variants.sku": updateData.sku
      });
      if (checkVariantProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
    }
    
    // For variable products, check if base SKU conflicts with variant SKUs
    if (currentProductType === "variable" && updateData.sku && updateData.sku !== product.sku) {
      // Check if the base SKU exists in other products
      const checkProduct = await Product.findOne({ 
        sku: updateData.sku,
        _id: { $ne: product._id }
      });
      if (checkProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
      
      // Check if the base SKU exists in any variant of any product
      const checkVariantProduct = await Product.findOne({
        _id: { $ne: product._id },
        "variants.sku": updateData.sku
      });
      if (checkVariantProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU MUST UNIQUE",
        });
      }
    }

    // Check variant SKU uniqueness for variable products
    if (currentProductType === "variable" && updateData.variants) {
      const variantSkus = updateData.variants
        .map((v) => v.sku)
        .filter((sku) => sku && sku.trim() !== "");
      
      if (variantSkus.length > 0) {
        // Check if any variant SKU matches the simple product SKU
        const productSku = updateData.sku || product.sku;
        if (productSku && productSku.trim() !== "") {
          const simpleSku = productSku.trim();
          if (variantSkus.includes(simpleSku)) {
            return res.status(400).json({
              success: false,
              message: "Variant SKU cannot match product SKU",
              errors: { variants: "Variant SKUs must be unique and different from product SKU" },
            });
          }
        }
        
        // Get existing variant SKUs from current product to exclude them from uniqueness check
        const existingVariantSkus = (product.variants || [])
          .map((v) => v.sku)
          .filter((sku) => sku && sku.trim() !== "");
        
        // Only check SKUs that are new or changed
        const skusToCheck = variantSkus.filter(sku => !existingVariantSkus.includes(sku));
        
        if (skusToCheck.length > 0) {
          // Check if any variant SKU already exists in other products or in base SKU fields
          const existingProducts = await Product.find({
            _id: { $ne: product._id },
            $or: [
              { sku: { $in: skusToCheck } },
              { "variants.sku": { $in: skusToCheck } }
            ]
          });
          
          if (existingProducts.length > 0) {
            return res.status(400).json({
              success: false,
              message: "One or more variant SKUs already exist",
              errors: { variants: "Variant SKUs must be unique" },
            });
          }
        }
        
        // Also check for duplicate SKUs within the same product's variants
        const duplicateSkus = variantSkus.filter((sku, index) => 
          variantSkus.indexOf(sku) !== index && sku.trim() !== ""
        );
        if (duplicateSkus.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Duplicate SKUs found within variants",
            errors: { variants: "Each variant must have a unique SKU" },
          });
        }
      }
    }
    if (updateData.name && !updateData.slug) {
      // If name changes but slug not provided, generate new slug
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
      
      // Ensure slug uniqueness (excluding current product)
      let baseSlug = updateData.slug;
      let counter = 1;
      while (await Product.findOne({ slug: updateData.slug, _id: { $ne: product._id } })) {
        updateData.slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else if (updateData.slug) {
      // Validate slug uniqueness if provided
      const existingProduct = await Product.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: product._id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "A product with this slug already exists",
          errors: { slug: "Slug must be unique" },
        });
      }
    }

    // Normalize tags: accept array of tag names or ObjectIds; convert names to Tag ids
    if (Array.isArray(updateData.tags)) {
      const normalizedTagIds = [];
      for (const tagInput of updateData.tags) {
        try {
          // If it's a valid ObjectId, keep as is
          if (typeof tagInput === "string" && tagInput.match(/^[a-fA-F0-9]{24}$/)) {
            normalizedTagIds.push(tagInput);
            continue;
          }

          // Otherwise treat as a name
          let tagDoc = await Tag.findOne({ name: tagInput });
          if (!tagDoc) {
            tagDoc = await Tag.create({ name: String(tagInput) });
          }
          normalizedTagIds.push(tagDoc._id);
        } catch (_) {
          // Skip malformed tag inputs silently
        }
      }
      updateData.tags = normalizedTagIds;
    }

    // Set default productType if not provided
    if (!updateData.productType) {
      updateData.productType = product.productType || "simple";
    }

    // For variable products, ensure variants are properly structured
    if (updateData.productType === "variable" && updateData.variants) {
      // Ensure all variants have required fields
      updateData.variants = updateData.variants.map((variant) => {
        // Handle backward compatibility: convert old 'image' (singular) to 'images' (array)
        let variantImages = variant.images || [];
        if (variant.image && !variant.images) {
          // If old 'image' field exists but 'images' doesn't, convert it
          variantImages = [variant.image];
        }
        // Ensure images is an array
        if (!Array.isArray(variantImages)) {
          variantImages = variantImages ? [variantImages] : [];
        }
        
        // Create new variant object, explicitly removing old 'image' field
        const { image, ...variantWithoutImage } = variant;
        
        return {
          ...variantWithoutImage,
          images: variantImages,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
        };
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Delete old images that are no longer in the new images array
    if (req.body.images && Array.isArray(req.body.images)) {
      const imagesToDelete = findDeletedImages(oldImages, req.body.images);
      if (imagesToDelete.length > 0) {
        await deleteImageFiles(imagesToDelete);
      }
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Store images before deletion
    const productImages = product.images || [];
    
    // Collect all variant images
    const variantImages = [];
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant.images && Array.isArray(variant.images)) {
          variantImages.push(...variant.images);
        }
        // Handle backward compatibility with old 'image' field
        if (variant.image && !variant.images) {
          variantImages.push(variant.image);
        }
      });
    }
    
    const allImagesToDelete = [...productImages, ...variantImages];

    // Convert product ID to ObjectId for proper matching
    const productObjectId = new mongoose.Types.ObjectId(req.params.id);
    const productIdString = req.params.id;

    // Remove product from all carts
    // Method 1: Use $pull with ObjectId (most efficient)
    const cartUpdateResult1 = await Cart.updateMany(
      { "items.product": productObjectId },
      { $pull: { items: { product: productObjectId } } }
    );

    // Method 2: Use $pull with string ID (fallback)
    const cartUpdateResult2 = await Cart.updateMany(
      { "items.product": productIdString },
      { $pull: { items: { product: productIdString } } }
    );

    // Method 3: Manual cleanup for any remaining items (safety net)
    // Find all carts that might still have this product
    const allCarts = await Cart.find({
      "items.product": { $in: [productObjectId, productIdString] }
    });
    let cartsModified = 0;
    for (const cart of allCarts) {
      const originalLength = cart.items.length;
      cart.items = cart.items.filter(item => {
        // Compare both as ObjectId and as string
        const itemProductId = item.product?.toString ? item.product.toString() : String(item.product);
        const productIdStr = productObjectId.toString();
        return itemProductId !== productIdString && itemProductId !== productIdStr;
      });
      if (cart.items.length !== originalLength) {
        // Recalculate totals
        cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        await cart.save();
        cartsModified++;
      }
    }

    // Remove product from all wishlists
    // Method 1: Use $pull with ObjectId (most efficient)
    const wishlistUpdateResult1 = await Wishlist.updateMany(
      { "items.product": productObjectId },
      { $pull: { items: { product: productObjectId } } }
    );

    // Method 2: Use $pull with string ID (fallback)
    const wishlistUpdateResult2 = await Wishlist.updateMany(
      { "items.product": productIdString },
      { $pull: { items: { product: productIdString } } }
    );

    // Method 3: Manual cleanup for any remaining items (safety net)
    // Find all wishlists that might still have this product
    const allWishlists = await Wishlist.find({
      "items.product": { $in: [productObjectId, productIdString] }
    });
    let wishlistsModified = 0;
    for (const wishlist of allWishlists) {
      const originalLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(item => {
        // Compare both as ObjectId and as string
        const itemProductId = item.product?.toString ? item.product.toString() : String(item.product);
        const productIdStr = productObjectId.toString();
        return itemProductId !== productIdString && itemProductId !== productIdStr;
      });
      if (wishlist.items.length !== originalLength) {
        // Recalculate totalItems
        wishlist.totalItems = wishlist.items.length;
        await wishlist.save();
        wishlistsModified++;
      }
    }

    console.log(`Removed product ${req.params.id} from carts (updateMany: ${cartUpdateResult1.modifiedCount + cartUpdateResult2.modifiedCount}, manual: ${cartsModified}) and wishlists (updateMany: ${wishlistUpdateResult1.modifiedCount + wishlistUpdateResult2.modifiedCount}, manual: ${wishlistsModified})`);

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    // Delete all product and variant images
    if (allImagesToDelete.length > 0) {
      await deleteImageFiles(allImagesToDelete);
    }

    res
      .status(200)
      .json({ success: true, message: "Product removed successfully" });
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

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
      success: true,
      message: "Newest Products found successfully",
      products,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get recent purchases for the authenticated user, fallback to best sellers for non-authenticated users
// @route   GET /api/products/recent-purchases
// @access  Public (works for both authenticated and non-authenticated users)
const getRecentPurchases = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // If user is not authenticated, return best sellers
    if (!req.user || !req.user._id) {
      // Aggregate products by order frequency for best sellers
      const bestSellingProducts = await Order.aggregate([
        // Unwind order items to get individual products
        { $unwind: "$orderItems" },
        
        // Group by product and count occurrences
        {
          $group: {
            _id: "$orderItems.product",
            orderCount: { $sum: "$orderItems.quantity" },
            totalOrders: { $sum: 1 }
          }
        },
        
        // Sort by order count (most popular first)
        { $sort: { orderCount: -1 } },
        
        // Limit results
        { $limit: limit },
        
        // Lookup product details
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        
        // Unwind product array
        { $unwind: "$product" },
        
        // Lookup categories
        {
          $lookup: {
            from: "categories",
            localField: "product.categories",
            foreignField: "_id",
            as: "categories"
          }
        },
        
        // Project final structure
        {
          $project: {
            _id: "$product._id",
            name: "$product.name",
            description: "$product.description",
            price: "$product.price",
            images: "$product.images",
            categories: "$categories",
            orderCount: 1,
            totalOrders: 1
          }
        }
      ]);

      // If no orders exist, fallback to newest products
      if (bestSellingProducts.length === 0) {
        const products = await Product.find({})
          .populate("categories", "name")
          .sort({ createdAt: -1 })
          .limit(limit)
          .exec();

        return res.status(200).json({
          success: true,
          message: "Best Sellers found successfully (fallback to newest)",
          products,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Best Sellers found successfully",
        products: bestSellingProducts,
      });
    }

    // User is authenticated - find recent orders for this user
    const recentOrders = await Order.find({ user: req.user._id })
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
      products.sort(
        (a, b) =>
          (orderMap.get(a._id.toString()) ?? 0) -
          (orderMap.get(b._id.toString()) ?? 0)
      );
      products = products.slice(0, limit);
    } else {
      // Fallback: normal products (e.g., newest)
      products = await Product.find({})
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Recent Purchases found successfully",
        products,
      });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get best selling products based on order frequency
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate products by order frequency
    const bestSellingProducts = await Order.aggregate([
      // Unwind order items to get individual products
      { $unwind: "$orderItems" },
      
      // Group by product and count occurrences
      {
        $group: {
          _id: "$orderItems.product",
          orderCount: { $sum: "$orderItems.quantity" },
          totalOrders: { $sum: 1 }
        }
      },
      
      // Sort by order count (most popular first)
      { $sort: { orderCount: -1 } },
      
      // Limit results
      { $limit: limit },
      
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      
      // Unwind product array
      { $unwind: "$product" },
      
      // Lookup categories
      {
        $lookup: {
          from: "categories",
          localField: "product.categories",
          foreignField: "_id",
          as: "categories"
        }
      },
      
      // Project final structure
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          description: "$product.description",
          price: "$product.price",
          images: "$product.images",
          categories: "$categories",
          orderCount: 1,
          totalOrders: 1
        }
      }
    ]);

    // If no orders exist, fallback to newest products
    if (bestSellingProducts.length === 0) {
      const products = await Product.find({})
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return res.status(200).json({
        success: true,
        message: "Best Sellers found successfully (fallback to newest)",
        products,
      });
    }

    res.status(200).json({
      success: true,
      message: "Best Sellers found successfully",
      products: bestSellingProducts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  searchProducts,
  getNewProducts,
  getRecentPurchases,
  getBestSellers,
};
