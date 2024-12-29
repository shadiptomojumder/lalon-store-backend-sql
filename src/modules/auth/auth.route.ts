import express from 'express'
import { AuthController } from './auth.controller';
import { validateSchema } from '../../middlewares/validationSchema';
import { loginRequestSchema, signupRequestSchema } from '@/auth/auth.schemas';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post("/signup",validateRequest(signupRequestSchema) , AuthController.signup)
router.post("/login",validateRequest(loginRequestSchema) , AuthController.login)

export const AuthRoutes = router