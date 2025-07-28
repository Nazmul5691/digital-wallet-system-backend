import { Types } from "mongoose";

export enum IsActive {
    BLOCKED = "BLOCKED",
    ACTIVE = "ACTIVE"
}


export interface IAuthProvider {
    provider: "google" | "credentials";
    providerId: string
}


export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT"
}


export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isActive?: IsActive;
    isDeleted?: boolean;
    isVerified?: boolean;
    role: Role;
    auths: IAuthProvider[];

    // Optional fields depending on role
    isApproved?: boolean;          // for agents
    commissionRate?: number;       // for agents
    walletId?: Types.ObjectId;  
}