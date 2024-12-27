import express, { NextFunction, Request, Response } from 'express';

import { validateSchema } from '../../middlewares/validationSchema';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { productController } from './product.controller';
import { productValidation } from './product.validation';


const router = express.Router();

router.post("/create",[validateRequest(productValidation.productSchema)],productController.createProduct)
router.get("/:id",[validateRequest(productValidation.getSingleProductSchema)],productController.getSingleProduct)

export const productRoutes = router;