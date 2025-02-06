import express from "express";
import { productController } from "./product.controller";

const router = express.Router();

// Create a new category
router.post("/category/create", productController.createCategory);

// Get all categories
router.get("/category/all", productController.getAllCategory);

// Create a new Product
router.post("/create", productController.createProduct);

// Update a Product
router.patch("/:id", productController.updateProduct);

// Get all products with filters
router.get("/all", productController.getAllProduct);

// Get a single product by ID
router.get("/:id", productController.getSingleProduct);

// Delete a single product by ID
router.delete("/:id?", productController.deleteProduct);

export const productRoutes = router;
