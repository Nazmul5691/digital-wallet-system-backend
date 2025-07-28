import { Request, Response } from "express";
import { IUser } from "./user.interface";
import { User } from "./user.model";




// create user
const createUser = async (payload: Partial<IUser>) => {
    const { name, email } = payload;

    const user = await User.create({
        name,
        email
    })

    return user;
}


// get all users
const getAllUsers = async() =>{
    const users = await User.find();

    const totalUsers = await User.countDocuments()

    return{
        meta: {
            total: totalUsers
        },
        data: users,
        
    }
}


const getSingleUser = async (id: string) =>{

    const user = await User.findById(id);

    return{
        data: user
    }
}


const deleteUser = async (id: string) =>{
    
    const user = await User.findByIdAndDelete(id);

    return{
        data: user
    }
}



export const UserServices = {
    createUser,
    getAllUsers,
    getSingleUser,
    deleteUser
}