import ApiError from "@/errors/ApiError";
import { hashedPassword } from "@/helpers/hashPasswordHelper";
import { paginationHelpers } from "@/helpers/paginationHelper";
import { IAuthUser, IGenericResponse } from "@/interfaces/common";
import { IPaginationOptions } from "@/interfaces/pagination";
import prisma from "@/shared/prisma";
import { userSchema } from "@/user/user.schemas";
import { users } from "@prisma/client";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";

const createUser = async (req: Request) => {
  const parseBody = userSchema.safeParse(req.body);
  if (!parseBody.success) {
    const errorMessages = parseBody.error.errors
      .map((error) => error.message)
      .join(",");
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
  }

  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [
        { email: parseBody.data.email },
        { fullname: parseBody.data.fullname },
      ],
    },
  });
  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User already exists");
  }

  const hashPassword = await hashedPassword(parseBody.data.password);
  const user = await prisma.users.create({
    data: {
      ...parseBody.data,
      password: hashPassword,
    },
  });
  return user;
};

const getMyProfile = async (authUser: any) => {
  const user = await prisma.users.findUnique({
    where: {
      id: authUser.userId,
    },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
  return user;
};

const getOneUser = async (authUser: any) => {
  const user = await prisma.users.findUnique({
    where: {
      id: authUser,
    },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
  return user;
};

const getAllUser = async (
  filters: any,
  options: IPaginationOptions,
  authUser: IAuthUser
): Promise<IGenericResponse<users[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  // auth role base logic here

  // const andConditions = [];

  // if (authUser?.role === userRole.USER) {
  //   andConditions.push({
  //     products: {
  //       email: authUser?.email,
  //     },
  //   });
  // } else {
  //   andConditions.push({
  //     products: {
  //       email: authUser?.email,
  //     },
  //   });
  // }

  // if (Object.keys(filters).length > 0) {
  //   andConditions.push({
  //     AND: Object.keys(filters).map(key => ({
  //       [key]: {
  //         equals: (filters as any)[key],
  //       },
  //     })),
  //   });
  // }

  // const whereConditions: Prisma.productsWhereInput =
  //   andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.users.findMany({
    // where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "asc",
          },
  });
  const total = await prisma.users.count({
    // where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const UserServices = {
  createUser,
  getMyProfile,
  getOneUser,
  getAllUser,
};
