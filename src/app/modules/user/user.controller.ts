import { Request, Response } from "express";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { IsActive } from "./user.interface";



// create User
const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User successfully created',
        data: user
    })
})



// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await UserServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All users retrieved",
        data: result.data,
        meta: result.meta,
    });
})


// get single user
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { id: requestedUserId } = req.params;

    const result = await UserServices.getSingleUser(requestedUserId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User fetched successfully!",
        data: result,
    });
});

//get me
const getMe = catchAsync(async (req: Request, res: Response) => {

    const decodedToken = req.user as JwtPayload
    
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Your profile retrieved successfully",
        data: result.data,
    });
})


// delete a user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserServices.deleteUser(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
});


//update user
const updateUser = catchAsync(async (req: Request, res: Response) => {

    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const verifiedToken = req.user;

    const payload = req.body;

    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User updated successfully',
        data: user
    })
})


//get all agents
const getAllAgents = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await UserServices.getAllAgents(query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agents retrieved successfully!',
        data: result.data,
        meta: result.meta,
    });
});


const searchUser = catchAsync(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        throw new AppError(httpStatus.BAD_REQUEST, 'A search query (phone number or email) is required.');
    }

    const result = await UserServices.searchUserByPhoneOrEmail(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User found successfully!',
        data: result,
    });
});


const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { isActive } = req.body as { isActive: IsActive };

    // 1. Validate the input
    if (!Object.values(IsActive).includes(isActive)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status provided. Must be ACTIVE or BLOCKED.');
    }

    // 2. Call the service to update the user's status
    const result = await UserServices.updateUserStatus(userId, isActive);

    // 3. Send a success response
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User status updated successfully.',
        data: result,
    });
});


// update Agent Approval Status
const updateAgentApprovalStatus = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { isApproved } = req.body as { isApproved: boolean };


    if (typeof isApproved !== 'boolean') {
        throw new AppError(httpStatus.BAD_REQUEST, 'The "isApproved" status must be a boolean value (true/false).');
    }

    const result = await UserServices.updateAgentApprovalStatus(userId, isApproved);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Agent approval status updated to ${result.isApproved} successfully!`,
        data: result,
    });
});



export const UserControllers = {
    createUser,
    getAllUsers,
    getSingleUser,
    getMe,
    deleteUser,
    updateUser,
    getAllAgents,
    searchUser,
    updateUserStatus,
    updateAgentApprovalStatus,
}