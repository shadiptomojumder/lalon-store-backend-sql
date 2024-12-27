import config from '@/config';
import catchAsync from '@/shared/catchAsync';
import sendResponse from '@/shared/sendResponse';
import { Request, Response } from 'express';
import { ILoginUserResponse } from '@/auth/auth.interface';
import { AuthServices } from '@/auth/auth.services';

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully !',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const AuthController = {
  login,
};
