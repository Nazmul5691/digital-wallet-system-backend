
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { WalletServices } from "./wallet.service";
import { IsActive } from "../user/user.interface";



//deposit
const deposit = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId; // from auth middleware
    const amount = req.body.amount;

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


// cash in
const cashIn = catchAsync(async (req: Request, res: Response) => {
    const agentUserId = req.user.userId;
    const role = req.user.role;

    const { targetUserId, amount } = req.body;

    const result = await WalletServices.cashIn({
        agentUserId,
        targetUserId,
        amount,
        role,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Cash-in successful!',
        data: result,
    });
});


// cash out
const cashOut = catchAsync(async (req: Request, res: Response) => {
    const agentUserId = req.user.userId;
    const role = req.user.role;


    const { targetUserId, amount } = req.body;

    const result = await WalletServices.cashOut({
        agentUserId,
        targetUserId,
        amount,
        role,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Cash-out successful!',
        data: result,
    });
});


// get all wallets
const getAllWallets = catchAsync(async (req: Request, res: Response) => {
    const result = await WalletServices.getAllWallets(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Wallets retrieved successfully!',
        data: result.data,
        meta: result.meta,
    });
});



// block a Wallet
const blockWallet = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await WalletServices.updateWalletStatus(id, IsActive.BLOCKED);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Wallet blocked successfully!',
        data: result,
    });
});


// unblock a Wallet
const unblockWallet = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await WalletServices.updateWalletStatus(id, IsActive.ACTIVE);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Wallet unblocked successfully!',
        data: result,
    });
});


// deactivate Wallet
const deactivateMyWallet = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.body;

    const result = await WalletServices.deactivateMyWallet(userId, status as IsActive);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Wallet deactivated successfully!',
        data: result,
    });
});


const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const result = await WalletServices.getMyWallet(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet fetched successfully!',
    data: result,
  });
});



export const WalletControllers = {
    deposit,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getAllWallets,
    blockWallet,
    unblockWallet,
    deactivateMyWallet,
    getMyWallet
}