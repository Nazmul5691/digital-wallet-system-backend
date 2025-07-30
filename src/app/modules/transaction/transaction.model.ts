import { Schema, model } from 'mongoose';
import { ITransaction, TransactionType } from './transaction.interface';


const transactionSchema = new Schema<ITransaction>(
    {
        wallet: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Transaction = model<ITransaction>('Transaction', transactionSchema);