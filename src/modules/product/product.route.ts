import express from "express";

import validateRequest from "../../middlewares/validateRequest";
import { productController } from "./product.controller";
import { productValidation } from "./product.validation";

const router = express.Router();

// Create a new category
router.post("/category/create", productController.createCategory);

// Get all categories
router.get("/category/all", productController.getAllCategory);

// Create a new Product
router.post("/create", productController.createProduct);

export const productRoutes = router;
