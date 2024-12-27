import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';
import { ILoginUser } from './auth.interface';
import { AuthUtils } from './auth.utils';

const login = async (req: Request) => {
  const { email, password }: ILoginUser = req.body;

  const isUserExist = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await AuthUtils.comparePasswords(password, isUserExist.password))
  ) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect');
  }

  //you can add user role here and authorize by role
  const { id: userId, email: userEmail, role: userRole } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, userEmail, userRole },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, userEmail, userRole },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  login,
};
