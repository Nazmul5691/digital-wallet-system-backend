
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { WalletServices } from "./wallet.service";



//deposit
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


//withdraw
const withdraw = catchAsync(async (req: Request, res: Response) => {
    
    const userId = req.user.userId; 
    const amount = req.body.amount;
    const role = req.user.role; 

    const result = await WalletServices.withdraw({
        userId,
        amount,
        role,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Balance withdrawn successfully!',
        data: result,
    });
});


// send Money
const sendMoney = catchAsync(async (req: Request, res: Response) => {
    const senderUserId = req.user.userId;
    const role = req.user.role;

    const { receiverId, amount } = req.body; 

    const result = await WalletServices.sendMoney({
        senderUserId,
        receiverId, 
        amount,
        role,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Money sent successfully!',
        data: result,
    });
});




export const WalletControllers = {
    deposit,
    withdraw,
    sendMoney,
}