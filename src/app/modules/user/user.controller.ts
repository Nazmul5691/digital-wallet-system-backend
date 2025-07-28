import { Request, Response } from "express";
import { UserServices } from "./user.service";


// create user
const createUser = async (req: Request, res: Response) => {
    try {
        const user = await UserServices.createUser(req.body)

        res.status(200).json({
            message: "User created successfully",
            user
        })
    } catch (error) {
        console.log(error);
    }
}


// get all users
const getAllUsers = async(req: Request, res: Response) =>{
    try {
        const users = await UserServices.getAllUsers();

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        })
    } catch (error) {
        console.log(error);
    }
}


// get single user
const getSingleUser = async(req: Request, res: Response) =>{
    try {
        const id = req.params.id
        const user = await UserServices.getSingleUser(id);


        res.status(200).json({
            message: "User retrieved successfully",
            user
        })

    } catch (error) {
        console.log(error);
    }
}



// get single user
const deleteUser = async(req: Request, res: Response) =>{
    try {
        const id = req.params.id
        const user = await UserServices.deleteUser(id);


        res.status(200).json({
            message: "User deleted successfully",
            user
        })

    } catch (error) {
        console.log(error);
    }
}






export const UserControllers = {
    createUser,
    getAllUsers,
    getSingleUser,
    deleteUser
}