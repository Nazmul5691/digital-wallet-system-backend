import { Schema, model } from 'mongoose';
import { IWallet } from './wallet.interface';
import { IsActive } from '../user/user.interface';



const walletSchema = new Schema<IWallet>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 50,
        },
        status: {
            type: String,
            enum: Object.values(IsActive),
            default: IsActive.ACTIVE,
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Wallet = model<IWallet>('Wallet', walletSchema);