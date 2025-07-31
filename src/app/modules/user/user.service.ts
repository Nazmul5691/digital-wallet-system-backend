
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs'
import httpStatus from 'http-status-codes';
import { Wallet } from "../wallet/wallet.model";
import { Types } from "mongoose";




// create user

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

    // ✅ Now create wallet for ALL roles
    const wallet = await Wallet.create({
        userId: user._id,
        balance: 50,
        status: "ACTIVE",
    });

    user.walletId = wallet._id;
    await user.save();

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


const getSingleUser = async (id: string) => {

    const user = await User.findById(id);

    return {
        data: user
    }
}


//delete a User
const deleteUser = async (id: string) => {

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return deletedUser;
};

//update user
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    /**
     * email - can not change
     * name, phone, password, address
     * password - re hashing
     * only admin and superAdmin can update - role, isDeleted 
     * 
     * promoting to superAdmin  - only superAdmin
     */

    const ifUserExists = await User.findById(userId);

    if (!ifUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // email cannot be change
    if (payload.email) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email cannot be updated");
    }

    if (payload.name || payload.address || payload.password) {
        if (decodedToken.userId !== userId) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this information");
        }
    }

    // Only admin or superAdmin can update role, isDeleted, isActive, isVerified
    if (payload.role || payload.isDeleted !== undefined || payload.isActive !== undefined || payload.isVerified !== undefined) {
        if (decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }


    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser;

}


//get all agents
const getAllAgents = async (query: Record<string, string>) => {
    // Define searchable fields specific for agents (which are also users)
    const agentSearchableFields = ['name.firstName', 'name.lastName', 'email', 'phoneNumber', 'address'];

    // Start with a query that specifically finds users with the 'AGENT' role
    const queryBuilder = new QueryBuilder(User.find({ role: Role.AGENT }), query)
        .search(agentSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build().lean(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    };
};




const updateAgentApprovalStatus = async (userId: string, isApproved: boolean) => {
    // 1. ইউজার খুঁজে বের করা এবং নিশ্চিত করা যে সে একজন এজেন্ট।
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User (Agent) not found.');
    }
    if (user.role !== Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, 'The user is not an agent.');
    }
    
    // 2. এজেন্টের isApproved স্ট্যাটাস আপডেট করা।
    user.isApproved = isApproved;
    await user.save();

    return user;
};




export const UserServices = {
    createUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser,
    getAllAgents,
    updateAgentApprovalStatus
}