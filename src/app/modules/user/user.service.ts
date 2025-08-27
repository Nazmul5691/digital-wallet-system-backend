
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
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


// get Single User
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

    if (payload.name || payload.address || payload.password || payload.phone) {
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


    if (payload.phone) {
    // Check if any other user has this phone
    const phoneExists = await User.findOne({
        phone: payload.phone,
        _id: { $ne: userId } // exclude current user
    });

    if (phoneExists) {
        throw new AppError(httpStatus.BAD_REQUEST, "Phone number already exists");
    }
}


    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser;
}




//get all agents
const getAllAgents = async (query: Record<string, string>) => {
    // Define searchable fields specific for agents (which are also users)
    const agentSearchableFields = ['name', 'email'];


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


//get me
const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");

    return {
        data: user
    }
};


const searchUserByPhoneOrEmail = async (searchTerm: string) => {
    // The search term is escaped to prevent regex injection attacks
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearchTerm, 'i');

    const user = await User.findOne({
        $or: [
            { email: regex },
            { phone: regex }
        ],
        isDeleted: false,
    }).select('_id name'); // Return only the user's ID and name for security and efficiency

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
    }

    return user;
};


const updateUserStatus = async (userId: string, isActive: IsActive) => {
    // 1. Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // 2. Prevent blocking an admin or super admin
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, 'Cannot block/unblock a super admin or admin.');
    }

    // 3. Update the user's status
    user.isActive = isActive;
    await user.save();

    // 4. Update the wallet status to match the user status
    if (user.walletId) {
        await Wallet.findByIdAndUpdate(user.walletId, { status: isActive });
    }

    return user;
};


// update Agent Approval Status
const updateAgentApprovalStatus = async (userId: string, isApproved: boolean) => {

    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User (Agent) not found.');
    }
    if (user.role !== Role.AGENT) {
        throw new AppError(httpStatus.FORBIDDEN, 'The user is not an agent.');
    }


    user.isApproved = isApproved;
    await user.save();

    return user;
};



export const UserServices = {
    createUser,
    getAllUsers,
    getSingleUser,
    getMe,
    deleteUser,
    updateUser,
    getAllAgents,
    searchUserByPhoneOrEmail,
    updateUserStatus,
    updateAgentApprovalStatus
}