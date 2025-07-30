import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User successfully created',
        data: user
    })
})



// get all users
// const getAllUsers = async(req: Request, res: Response) =>{
//     try {
//         const users = await UserServices.getAllUsers();

//         res.status(200).json({
//             message: "Users retrieved successfully",
//             users
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

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

// const getSingleUser = async(req: Request, res: Response) =>{
//     try {
//         const id = req.params.id
//         const user = await UserServices.getSingleUser(id);


//         res.status(200).json({
//             message: "User retrieved successfully",
//             user
//         })

//     } catch (error) {
//         console.log(error);
//     }
// }

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
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
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

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






export const UserControllers = {
    createUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser
}