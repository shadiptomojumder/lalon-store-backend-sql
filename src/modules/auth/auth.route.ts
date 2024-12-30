import { AuthController } from "@/auth/auth.controller";
import { loginRequestSchema, signupRequestSchema } from "@/auth/auth.schemas";
import validateRequest from "@/middlewares/validateRequest";
import express from "express";

const router = express.Router();

router.post(
  "/signup",
  validateRequest(signupRequestSchema),
  AuthController.signup
);
router.post(
  "/login",
  validateRequest(loginRequestSchema),
  AuthController.login
);

export const AuthRoutes = router;
