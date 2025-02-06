import { z } from "zod";

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Product name is required" })
    .max(255, { message: "Product name must be less than 255 characters" }),

  price: z
    .number()
    .positive({ message: "Price must be a positive number" })
    .or(z.number().positive({ message: "Price must be a positive number" })),
  
  discount: z
    .number()
    .min(0, { message: "Discount must be between 0 and 100" })
    .max(100, { message: "Discount must be between 0 and 100" })
    .optional(), // Discount is optional
  
  finalPrice: z
    .number()
    .positive({ message: "Final price must be a positive number" })
    .optional(),
  
  quantity: z
    .string()
    .min(1, { message: "Quantity is required" })
    .max(50, { message: "Quantity should not exceed 50 characters" }),

  description: z
    .string()
    .max(1000, { message: "Description should not exceed 1000 characters" })
    .optional(),
  
  stock: z
    .number()
    .min(0, { message: "Stock must be a positive number" })
    .optional(),

  images: z
    .array(z.string().url({ message: "Each image must be a valid URL" }))
    .min(1, { message: "At least one image is required" })
    .optional(),

  sku: z
    .string()
    .min(1, { message: "SKU is required" })
    .max(50, { message: "SKU should not exceed 50 characters" })
    .optional(),

  isActive: z
    .boolean()
    .optional(),

  categoryId: z
    .string()
    .min(1, { message: "Category ID is required" })
    .uuid({ message: "Category ID must be a valid UUID" })
});

// Product Input Schema (used when accepting input from user)
export const ProductInput = productSchema.extend({
  // Use the same validation but make the SKU optional if it's auto-generated
  sku: z.string().optional(),
});

// Product Update Schema (to handle updates)
export const productUpdateSchema = productSchema.partial().extend({
  // Allow partial updates
});

// Category validation schema
export const categorySchema = z.object({
  title: z
    .string()
    .min(3, "Category title must be at least 3 characters")
    .max(50, "Category title not more than 50 characters")
    .trim(),
  value: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Value must be lowercase with underscores only") // Enforces proper format
    .trim()
    .optional(),
  thumbnail: z.string().url("Invalid thumbnail URL").optional(), // Thumbnail should be a valid URL
});
