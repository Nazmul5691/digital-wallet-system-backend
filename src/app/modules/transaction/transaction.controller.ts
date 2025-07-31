import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { TransactionServices } from "./transaction.service";


// view transaction
// const viewTransaction = catchAsync(async (req: Request, res: Response) => {
//     const { userId: authenticatedUserId, role } = req.user;


//     const result = await TransactionServices.viewTransaction({
//         authenticatedUserId,
//         role,
//         query: req.query as Record<string, string>,
//     });

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Transaction history retrieved successfully!',
//         data: result.data,
//         meta: result.meta,
//     });
// });

const viewTransaction = catchAsync(async (req: Request, res: Response) => {
    const { userId: authenticatedUserId, role } = req.user;

    const result = await TransactionServices.viewTransaction({
        authenticatedUserId,
        role,
        query: req.query as Record<string, string>,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Transaction history retrieved successfully!',
        data: result.data,
        meta: result.meta,
    });
});




const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    // For this endpoint, we assume the user is ADMIN/SUPER_ADMIN
    // The service handles filtering based on query params like 'userId' or 'type'
    const result = await TransactionServices.getAllTransactions(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All transactions retrieved successfully!',
        data: result.data,
        meta: result.meta,
    });
});



export const TransactionControllers = {
    viewTransaction,
    getAllTransactions,
}


