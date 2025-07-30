
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { WalletServices } from "./wallet.service";



const deposit = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId; // from auth middleware
    const amount = req.body.amount;

    // console.log('User ID from auth middleware (req.user._id):', userId);

    const result = await WalletServices.deposit({
        userId,
        amount,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Balance deposited successfully!',
        data: result,
    });
});






export const WalletControllers = {
    deposit
}