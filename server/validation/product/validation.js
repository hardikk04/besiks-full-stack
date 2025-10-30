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

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),

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

  colors: z
    .array(
      z.object({
        name: z.string().min(1, "Color name is required"),
        value: z.string().min(1, "Color value is required"), // hex or css color
      })
    )
    .optional(),

  sizes: z.array(z.string().min(1, "Size cannot be empty")).optional(),

  brand: z.string().optional(),

  sku: z.string().optional(),

  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .min(0, "Stock cannot be negative")
    .default(0),

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
});

module.exports = {
  getAllProductValidation,
  mongooseIdValidation,
  createProductValidation,
};
