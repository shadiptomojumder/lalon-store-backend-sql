import ApiError from "@/errors/ApiError";
import { paginationHelpers } from "@/helpers/paginationHelper";
import { IAuthUser, IGenericResponse } from "@/interfaces/common";
import { IPaginationOptions } from "@/interfaces/pagination";
import prisma from "@/shared/prisma";
import { Prisma, users } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const getMyProfile = async (authUser: any) => {
  const user = await prisma.users.findUnique({
    where: {
      id: authUser.userId,
    },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
  return user;
};

const getOneUser = async (userId: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
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

const getAllUser = async (
  filters: any,
  options: IPaginationOptions,
  authUser: IAuthUser
): Promise<IGenericResponse<users[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);

    // console.log("40.filters is:", filters);

    // auth role base logic here

    const andConditions = [];

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

    // Apply filters
    if (Object.keys(filters).length > 0) {
      andConditions.push({
        AND: Object.keys(filters).map((key) => {
          if (key === "fullname") {
            return {
              [key]: {
                contains: filters[key],
                mode: "insensitive" as Prisma.QueryMode, // Case-insensitive search
              },
            };
          }
          return {
            [key]: {
              equals: filters[key],
            },
          };
        }),
      });
    }

    // Debug: Log the constructed where conditions
    // console.log(
    //   "Constructed where conditions:",
    //   JSON.stringify(andConditions, null, 2)
    // );

    const whereConditions: Prisma.usersWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.users.findMany({
      where: whereConditions,
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
      where: whereConditions,
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
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

export const UserServices = {
  getMyProfile,
  getOneUser,
  getAllUser,
};
