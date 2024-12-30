import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IAuthUser } from "../../interfaces/common";
import asyncErrorHandler from "@/shared/asyncErrorHandler";
import pick from "../../shared/pick";
import prisma from "../../shared/prisma";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.services";
import { userFilterAbleFields } from "./user.utils";

// Controller function to get all user 
const getAllUser = asyncErrorHandler(async (req: Request, res: Response) => {
  // Extract filters from the query parameters using the pick function and userFilterAbleFields array
  const filters: Record<string, any> = pick(req.query, userFilterAbleFields);
  const options: Record<string, any> = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const user: IAuthUser = req.user as IAuthUser;
  

  const result = await UserServices.getAllUser(
    filters,
    options,
    user
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All user retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyProfile = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await UserServices.getMyProfile(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile data fetched!",
    data: result,
  });
});

const getOneUser = asyncErrorHandler(async (req: Request, res: Response) => {
  const user = req.params.id;

  const result = await UserServices.getOneUser(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile data fetched!",
    data: result,
  });
});

export async function getUser(req: Request, res: Response) {
  const id = req.params.id;
  const user = await prisma.users.findFirst({
    where: {
      id: id,
    },
  });

  res.json({
    status: true,
    message: "User Successfully fetched but id",
    data: user,
  });
}

export const UserController = {
  getMyProfile,
  getOneUser,
  getUser,
  getAllUser,
};
