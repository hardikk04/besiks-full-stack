const { z } = require("zod");

const validateCouponValidation = z.object({
  code: z
    .string({
      required_error: "Coupon code is required",
      invalid_type_error: "Coupon code must be a string",
    })
    .trim()
    .min(1, "Coupon code cannot be empty"),

  orderAmount: z
    .number({
      required_error: "Order amount is required",
      invalid_type_error: "Order amount must be a number",
    })
    .positive("Order amount must be greater than 0"),
});

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const createCouponValidation = z.object({
  code: z
    .string({
      required_error: "Coupon code is required",
      invalid_type_error: "Coupon code must be a string",
    })
    .trim()
    .max(20, "Coupon code cannot be more than 20 characters"),

  name: z
    .string({
      required_error: "Coupon name is required",
      invalid_type_error: "Coupon name must be a string",
    })
    .trim()
    .max(100, "Coupon name cannot be more than 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot be more than 500 characters")
    .optional(),

  discountType: z.enum(["percentage", "fixed"], {
    required_error: "Discount type is required",
  }),

  discountValue: z
    .number({
      required_error: "Discount value is required",
      invalid_type_error: "Discount value must be a number",
    })
    .nonnegative("Discount value cannot be negative"),

  minimumOrderAmount: z
    .number()
    .nonnegative("Minimum order amount cannot be negative")
    .optional()
    .default(0),

  maximumDiscount: z
    .number()
    .nonnegative("Maximum discount cannot be negative")
    .optional(),

  validFrom: z.preprocess(
    (val) => (val ? new Date(val) : val),
    z.date({ required_error: "Valid from date is required" })
  ),

  validUntil: z.preprocess(
    (val) => (val ? new Date(val) : val),
    z.date({ required_error: "Valid until date is required" })
  ),

  usageLimit: z
    .number()
    .int()
    .min(1, "Usage limit must be at least 1")
    .nullable()
    .optional(),

  usageCount: z.number().int().nonnegative().optional().default(0),

  userUsageLimit: z
    .number()
    .int()
    .min(1, "User usage limit must be at least 1")
    .optional()
    .default(1),

  applicableCategories: z.array(objectIdSchema).optional(),
  applicableProducts: z.array(objectIdSchema).optional(),
  excludedCategories: z.array(objectIdSchema).optional(),
  excludedProducts: z.array(objectIdSchema).optional(),

  isActive: z.boolean().optional().default(true),
  isFirstTimeUser: z.boolean().optional().default(false),
  isNewUser: z.boolean().optional().default(false),
});

module.exports = { validateCouponValidation, createCouponValidation };
