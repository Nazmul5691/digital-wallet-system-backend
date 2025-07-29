import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";



const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    const { accessToken, refreshToken, user } = loginInfo;

    setAuthCookie(res, { accessToken, refreshToken });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User logged in successfully',
        data: {
            accessToken,
            refreshToken,
            user
        }
    });
});


export const AuthControllers = {
    credentialsLogin

}