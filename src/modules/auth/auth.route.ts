import express from 'express'
import { AuthController } from './auth.controller';
import { validateSchema } from '../../middlewares/validationSchema';
import { AuthValidation, createUserSchema } from '@/auth/auth.schemas';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post("/signup",validateRequest(createUserSchema) , AuthController.signup)
router.post("/login",validateSchema(AuthValidation.login) ,AuthController.login)

export const AuthRoutes = router