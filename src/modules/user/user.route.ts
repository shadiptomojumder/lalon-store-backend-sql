import auth from "@/middlewares/auth";
import validateRequest from "@/middlewares/validateRequest";
import { UserController } from "@/user/user.controller";
import { UserValidation } from "@/user/user.schemas";
import express from "express";
import { ENUM_USER_ROLE } from "../../enums/user";

const router = express.Router();

// Route to get all users
router.get("/all",auth(ENUM_USER_ROLE.SELLER,ENUM_USER_ROLE.USER), UserController.getAllUser);

// Route to get the profile of the authenticated user
// Requires the user to have the SELLER role
router.get(
  "/profile",
  auth(ENUM_USER_ROLE.SELLER),
  UserController.getMyProfile
);



// Route to get a user by ID
router.get("/:id", UserController.getOneUser);

export const userRoutes = router;
