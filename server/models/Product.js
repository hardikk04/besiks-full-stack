const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  // Product type: 'simple' or 'variable'
  productType: {
    type: String,
    enum: ['simple', 'variable'],
    default: 'simple'
  },
  price: {
    type: Number,
    required: function() {
      // Price is required for simple products, optional for variable products
      return this.productType === 'simple';
    },
    min: [0, 'Price cannot be negative']
  },
  mrp: {
    type: Number,
    min: [0, 'MRP cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  }],
  images: [{
    type: String,
    required: [true, 'Product image is required']
  }],
  featuredImageIndex: {
    type: Number,
    default: 0,
    min: 0
  }, // Index of the featured image in the images array
  // Legacy fields - kept for backward compatibility
  colors: [{
    name: { type: String, trim: true },
    value: { type: String, trim: true }
  }],
  sizes: [{ type: String, trim: true }],
  // Variant attributes (e.g., Color, Size, Material) - for variable products
  variantOptions: [{
    name: { 
      type: String, 
      required: true, 
      trim: true 
    }, // e.g., "Color", "Size", "Material"
    values: [{ 
      type: String, 
      trim: true 
    }] // e.g., ["Red", "Blue", "Green"] or ["S", "M", "L"]
  }],
  // Product variants (combinations of options) - for variable products
  variants: [{
    // Options as a plain object (easier to work with than Map)
    options: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }, // e.g., { "Color": "Red", "Size": "M" }
    price: {
      type: Number,
      required: true,
      min: [0, 'Variant price cannot be negative']
    },
    mrp: {
      type: Number,
      min: [0, 'Variant MRP cannot be negative']
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      trim: true
    }], // Optional: variant-specific images array
    featuredImageIndex: {
      type: Number,
      default: 0,
      min: 0
    }, // Index of the featured image in the variant images array
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true, // Only enforce uniqueness for non-null values
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot be more than 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  stock: {
    type: Number,
    required: function() {
      // Stock is required for simple products, optional for variable products (handled at variant level)
      return this.productType === 'simple';
    },
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  tax: {
    type: String,
    trim: true,
    default: "0"
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Auto-generate slug from name if not provided
productSchema.pre('save', async function(next) {
  // Only generate slug if it's not provided or if the name has changed
  if (!this.slug || this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists and make it unique
    const Product = mongoose.model('Product');
    while (await Product.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Create index on slug for faster queries
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema); 