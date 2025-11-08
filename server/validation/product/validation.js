const { default: mongoose } = require("mongoose");
const { z } = require("zod");

const getAllProductValidation = z.object({
  page: z
    .string()
    .transform(Number)
    .default("1")
    .refine((n) => n > 0, "Page must be greater than 0"),

  limit: z
    .string()
    .transform(Number)
    .default("10")
    .refine((n) => n > 0 && n <= 100, "Limit must be between 1 and 100"),

  categories: z.string().optional(),
  search: z.string().optional(),

  sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const mongooseIdValidation = z.string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });;

const createProductValidation = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name cannot be more than 100 characters"),

  description: z
    .string()
    .min(1, "Product description is required")
    .max(1000, "Description cannot be more than 1000 characters"),

  productType: z
    .enum(["simple", "variable"])
    .default("simple")
    .optional(),

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .optional(),

  mrp: z
    .number({ invalid_type_error: "MRP must be a number" })
    .min(0, "MRP cannot be negative")
    .optional(),

  comparePrice: z
    .number({ invalid_type_error: "Compare price must be a number" })
    .min(0, "Compare price cannot be negative")
    .optional(),

    categories: z.array(z.string().min(1, "Category cannot be empty"))
    .min(1, "At least one category is required"),

  images: z
    .array(z.string().url("Image must be a valid URL"))
    .min(1, "At least one product image is required"),
  
  featuredImageIndex: z.number().int().min(0).optional(),

  // Legacy fields - kept for backward compatibility
  colors: z
    .array(
      z.object({
        name: z.string().min(1, "Color name is required"),
        value: z.string().min(1, "Color value is required"), // hex or css color
      })
    )
    .optional(),

  sizes: z.array(z.string().min(1, "Size cannot be empty")).optional(),

  // Variable product fields
  variantOptions: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name is required"),
        values: z.array(z.string().min(1, "Attribute value cannot be empty")).min(1, "At least one attribute value is required"),
      })
    )
    .optional(),

  variants: z
    .array(
      z.object({
        options: z.record(z.string(), z.string()).refine(
          (options) => Object.keys(options).length > 0,
          "Variant must have at least one option"
        ),
        price: z.number({ invalid_type_error: "Variant price must be a number" }).min(0, "Variant price cannot be negative"),
        mrp: z.number({ invalid_type_error: "Variant MRP must be a number" }).min(0, "Variant MRP cannot be negative").optional(),
        stock: z.number({ invalid_type_error: "Variant stock must be a number" }).min(0, "Variant stock cannot be negative"),
        sku: z.string().optional(),
        images: z.array(z.string().url("Variant image must be a valid URL")).optional(),
        featuredImageIndex: z.number().int().min(0).optional(),
        // Keep old 'image' field for backward compatibility during validation
        image: z.string().url("Variant image must be a valid URL").optional().or(z.literal("")),
        isActive: z.boolean().default(true).optional(),
      })
    )
    .optional(),

  brand: z.string().optional(),

  sku: z.string().optional(),

  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .max(200, "Slug cannot be more than 200 characters")
    .optional(),
  
  metaTitle: z.string().max(60, "Meta title cannot be more than 60 characters").optional(),
  
  metaDescription: z.string().max(160, "Meta description cannot be more than 160 characters").optional(),

  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .min(0, "Stock cannot be negative")
    .default(0)
    .optional(),

  tax: z
    .string()
    .optional(),

  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(0, "Weight cannot be negative")
    .optional(),

  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),

  tags: z.array(z.string()).optional(), // ObjectId → string

  isActive: z.boolean().default(true),

  isFeatured: z.boolean().default(false),

  rating: z
    .number({ invalid_type_error: "Rating must be a number" })
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be more than 5")
    .default(0),

  numReviews: z
    .number({ invalid_type_error: "Number of reviews must be a number" })
    .min(0)
    .default(0),

  reviews: z
    .array(
      z.object({
        user: z.string().min(1, "User ID is required"), // ObjectId
        rating: z
          .number({ invalid_type_error: "Rating must be a number" })
          .min(1, "Rating must be at least 1")
          .max(5, "Rating cannot be more than 5"),
        comment: z
          .string()
          .min(1, "Review comment is required")
          .max(500, "Review comment cannot be more than 500 characters"),
        createdAt: z.date().default(() => new Date()),
      })
    )
    .optional(),
}).superRefine((data, ctx) => {
  const productType = data.productType || "simple";

  // For simple products, price and stock are required
  if (productType === "simple") {
    if (!data.price && data.price !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for simple products",
        path: ["price"],
      });
    }
    if (!data.stock && data.stock !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stock is required for simple products",
        path: ["stock"],
      });
    }
  }

  // For variable products, variantOptions and variants are required
  if (productType === "variable") {
    if (!data.variantOptions || data.variantOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one variant attribute is required for variable products",
        path: ["variantOptions"],
      });
    }
    if (!data.variants || data.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one variant is required for variable products",
        path: ["variants"],
      });
    }
  }

  // Validate that price is not higher than MRP (for simple products)
  if (productType === "simple" && data.mrp && data.price && data.price > data.mrp) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sale price cannot be higher than MRP",
      path: ["price"],
    });
  }

  // Validate variant prices and MRP
  if (data.variants && Array.isArray(data.variants)) {
    data.variants.forEach((variant, index) => {
      if (variant.mrp && variant.price && variant.price > variant.mrp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variant sale price cannot be higher than variant MRP",
          path: ["variants", index, "price"],
        });
      }
    });
  }
});

module.exports = {
  getAllProductValidation,
  mongooseIdValidation,
  createProductValidation,
};
