import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthUser } from '../../interfaces/common';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import prisma from '../../shared/prisma';
import sendResponse from '../../shared/sendResponse';
import { userFilterAbleFields } from './user.constant';
import { UserServices } from './user.services';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.createUser(req);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User created successfully!',
      data: result,
    });
  },
);

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterAbleFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const user = req.user;
  const result = await UserServices.getAllUser(
    filters,
    options,
    user as IAuthUser,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All user retrieval successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await UserServices.getMyProfile(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile data fetched!',
    data: result,
  });
});

const getOneUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.params.id;

  const result = await UserServices.getOneUser(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile data fetched!',
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
    message: 'User Successfully fetched but id',
    data: user,
  });
}

export const UserController = {
  createUser,
  getMyProfile,
  getOneUser,
  getUser,
  getAllUser,
};
