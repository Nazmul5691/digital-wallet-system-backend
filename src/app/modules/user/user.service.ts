
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs'
import httpStatus from 'http-status-codes';




// create user
// const createUser = async (payload: Partial<IUser>) => {
//     const { name, email } = payload;

//     const user = await User.create({
//         name,
//         email
//     })

//     return user;
// }

const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    const isUserExit = await User.findOne({ email });

    if (isUserExit) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user;
}



// get all users
// const getAllUsers = async() =>{
//     const users = await User.find();

//     const totalUsers = await User.countDocuments()

//     return{
//         meta: {
//             total: totalUsers
//         },
//         data: users,
        
//     }
// }

const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)

    const usersData = await queryBuilder
        .search(userSearchableFields)
        .sort()
        .filter()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
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