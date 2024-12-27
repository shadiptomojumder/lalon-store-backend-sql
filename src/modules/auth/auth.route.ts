import express from 'express'
import { AuthController } from './auth.controller';
import { validateSchema } from '../../middlewares/validationSchema';
import { AuthValidation } from './auth.validations';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post("/login",validateSchema(AuthValidation.login) ,AuthController.login)

export const AuthRoutes = router