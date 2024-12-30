import { loginDataSchema, signupDataSchema } from "@/auth/auth.schemas";
import { AuthUtils } from "@/auth/auth.utils";
import config from "@/config";
import ApiError from "@/errors/ApiError";
import { hashedPassword } from "@/helpers/hashPasswordHelper";
import prisma from "@/shared/prisma";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";

// Signup function to register a new user
const signup = async (req: Request) => {
  try {
    // Validate the request body against the user schema
    const parseBody = signupDataSchema.safeParse(req.body);
    if (!parseBody.success) {
      // If validation fails, collect error messages and throw a BAD_REQUEST error
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Check if a user with the same email or fullname already exists
    const isUserExist = await prisma.users.findFirst({
      where: {
        OR: [
          { email: parseBody.data.email },
          { fullname: parseBody.data.fullname },
        ],
      },
    });
    if (isUserExist) {
      // If user exists, throw a CONFLICT error
      throw new ApiError(StatusCodes.CONFLICT, "User already exists");
    }

    // Hash the user's password before storing it in the database
    const hashPassword = await hashedPassword(parseBody.data.password);

    // Create a new user in the database with the hashed password
    const user = await prisma.users.create({
      data: {
        ...parseBody.data,
        password: hashPassword,
      },
    });
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An unknown error occurred"
      );
    }
  }
};

// Login function to authenticate a user
const login = async (req: Request) => {
  try {
    // Validate the request body against the loginData schema
    const parseBody = loginDataSchema.safeParse(req.body);
    if (!parseBody.success) {
      // If validation fails, collect error messages and throw a BAD_REQUEST error
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Check if a user with the provided email exists
    const isUserExist = await prisma.users.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!isUserExist) {
      // If user does not exist, throw a NOT_FOUND error
      throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
    }

    // Compare the provided password with the hashed password stored in the database
    if (
      isUserExist.password &&
      !(await AuthUtils.comparePasswords(
        parseBody.data.password,
        isUserExist.password
      ))
    ) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Password is incorrect");
    }

    // Generate JWT tokens for authentication and authorization
    const { id: userId, email: userEmail, role: userRole } = isUserExist;

    const accessToken = AuthUtils.generateToken(
      { userId, userEmail, userRole },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );
    const refreshToken = AuthUtils.generateToken(
      { userId, userEmail, userRole },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );

    return {
      data: {
        user: {
          ...isUserExist,
        },
        accessToken,
        refreshToken,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An unknown error occurred"
      );
    }
  }
};

export const AuthServices = {
  signup,
  login,
};
