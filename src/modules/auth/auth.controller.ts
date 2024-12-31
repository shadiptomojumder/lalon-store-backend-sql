import { AuthServices } from "@/auth/auth.services";
import config from "@/config";
import ApiResponse from "@/shared/ApiResponse";
import asyncErrorHandler from "@/shared/asyncErrorHandler";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Controller function to handle user signup
const signup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Call the signup service to create a new user
    const result = await AuthServices.signup(req);

    // Send a response with the created user data
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User created successfully!",
      data: result,
    });
  }
);

// Controller function to handle user login
const login = asyncErrorHandler(async (req: Request, res: Response) => {
  // Call the login service to authenticate the user
  const result = await AuthServices.login(req);
  const { refreshToken, accessToken, user } = result.data;

  // Set the refresh token into a cookie with secure and httpOnly options
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  // Send a response with the user data and tokens
  ApiResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully !",
    data: {
      user: { ...user },
      accessToken,
      refreshToken,
    },
  });
});

export const AuthController = {
  signup,
  login,
};
