import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";


// credentials Login
const credentialsLogin = catchAsync(async (req: Request, res: Response) => {
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


// get New Access Token 
const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received frm cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'New access token retrieved successfully',
        data: tokenInfo
    })
})


// logout
const logout = catchAsync(async (req: Request, res: Response) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User logged out successfully',
        data: null
    })
})


export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout
}