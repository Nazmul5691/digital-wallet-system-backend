import { model, Schema, Types } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
    {
        provider: {
            type: String,
            required: true
        },
        providerId: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false,
        _id: false
    }
)

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String
        },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER
        },
        phone: {
            type: String,
            // unique: true
        },
        picture: {
            type: String
        },
        address: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: String,
            enum: Object.values(IsActive),
            default: IsActive.ACTIVE
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        auths: [authProviderSchema],
        isApproved: {
            type: Boolean,
            default: false,
        },
        commissionRate: {
            type: Number,
            default: 0
        },
        walletId: {
            type: Types.ObjectId,
            ref: "Wallet"
        }

    },
    {
        timestamps: true,
        versionKey: false
    }
)


export const User = model<IUser>("User", userSchema)