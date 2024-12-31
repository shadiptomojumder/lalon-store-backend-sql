import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import ApiError from '../errors/ApiError';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]; // Bearer <token>
      console.log("15.The accessToken is:",req.cookies?.accessToken);


      // checking if the token is missing
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
      }else{
        console.log("You are authorized!");
        
      }

      const decoded = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as string,
      ) as JwtPayload;

      const { userRole, userEmail, userId } = decoded;

      // checking if the user is exist
      const user = await prisma.users.findUnique({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'This user is not found !');
      }
      // checking if the user is already deleted

      // const status = user?.status;

      // if (status === 'BLOCKED') {
      //   throw new ApiError(StatusCodes.FORBIDDEN, 'This user is blocked !');
      // }

      // if (
      //   user.passwordChangedAt &&
      //   User.isJWTIssuedBeforePasswordChanged(
      //     user.passwordChangedAt,
      //     iat as number
      //   )
      // ) {
      //   throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized !');
      // }

      if (requiredRoles && !requiredRoles.includes(userRole)) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      req.user = decoded as JwtPayload;
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
