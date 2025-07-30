
import { Transaction } from '../transaction/transaction.model';
import { Types } from 'mongoose';
import httpStatus from 'http-status-codes';
import { TransactionType } from '../transaction/transaction.interface';
import AppError from '../../errorHelpers/appError';
import { Wallet } from './wallet.model';


// add money
const deposit = async (payload: { userId: string; amount: number | string }) => {

    const { userId, amount } = payload;

    console.log('Service: Initial amount from payload:', amount, 'Type:', typeof amount);

    const parsedAmount = Number(amount);

    console.log('Service: Parsed amount:', parsedAmount, 'Type:', typeof parsedAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0');
    }

    const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) });

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
    }

    wallet.balance += parsedAmount;

    await wallet.save();


    // Create transaction
    const depositTxn = await Transaction.create({
        wallet: wallet._id,
        senderId: new Types.ObjectId(userId),
        receiverId: new Types.ObjectId(userId),
        amount: parsedAmount,
        type: TransactionType.DEPOSIT,
        note: 'Wallet top-up',
    });

    return {
        message: 'Deposit successful',
        wallet,
        transaction: depositTxn,
    };
};

export const WalletServices = {
    deposit,
};

