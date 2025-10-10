const { z } = require("zod");

const createCategoryValidation = z.object({
  name: z
    .string({
      required_error: "Category name is required",
      invalid_type_error: "Category name must be a string",
    })
    .trim()
    .max(50, "Category name cannot be more than 50 characters"),

  description: z
    .string()
    .max(200, "Description cannot be more than 200 characters")
    .optional(),

  image: z.string().url("Image must be a valid URL").optional(),

  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .nullable()
    .optional(),

  isActive: z.boolean().optional().default(true),

  sortOrder: z.number().optional().default(0),
});

const searchCategoryValidation = z.object({
  search: z.string().min(1, "Search term is required").optional(),
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
  sortBy: z.enum(["name", "createdAt", "sortOrder"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

module.exports = {
  createCategoryValidation,
  searchCategoryValidation,
};
