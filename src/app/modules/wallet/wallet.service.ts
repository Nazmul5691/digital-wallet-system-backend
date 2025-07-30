
import { Transaction } from '../transaction/transaction.model';
import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status-codes';
import { TransactionType } from '../transaction/transaction.interface';
import AppError from '../../errorHelpers/appError';
import { Wallet } from './wallet.model';
import { QueryBuilder } from '../../utils/queryBuilder';


interface IGetTransactionsPayload {
    authenticatedUserId: string; // The ID of the currently authenticated user
    role: string; // The role of the authenticated user
    query: Record<string, string>; // The raw query object from req.query
}

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


// withdraw money
const withdraw = async (payload: { userId: string; amount: number | string; role: string }) => {
    const { userId, amount, role } = payload;

    const parsedAmount = Number(amount);


    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0');
    }


    if (role === 'AGENT') {
        throw new AppError(httpStatus.FORBIDDEN, 'Agents are not allowed to withdraw.');
    }


    const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) });

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found.');
    }


    if (wallet.balance < parsedAmount) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance.');
    }


    wallet.balance -= parsedAmount;
    await wallet.save();


    const withdrawTxn = await Transaction.create({
        wallet: wallet._id,
        senderId: new Types.ObjectId(userId),
        receiverId: new Types.ObjectId(userId),
        amount: parsedAmount,
        type: TransactionType.WITHDRAW,
        note: 'Wallet withdrawal',
    });

    return {
        message: 'Withdrawal successful',
        wallet,
        transaction: withdrawTxn,
    };
};


//send money
const sendMoney = async (payload: { senderUserId: string; receiverId: string; amount: number | string; role: string }) => {
    const { senderUserId, receiverId, amount, role } = payload;

    const parsedAmount = Number(amount);


    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0.');
    }

    if (role === 'AGENT') {
        throw new AppError(httpStatus.FORBIDDEN, 'Agents are not allowed to send money.');
    }

    let session = null;

    try {
        session = await mongoose.startSession();
        session.startTransaction();


        const senderWallet = await Wallet.findOne({ userId: new Types.ObjectId(senderUserId) }).session(session);

        if (!senderWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Sender wallet not found.');
        }


        if (senderWallet.balance < parsedAmount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance.');
        }



        if (receiverId.toString() === senderUserId.toString()) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Cannot send money to yourself.');
        }


        const receiverWallet = await Wallet.findOne({ userId: new Types.ObjectId(receiverId) }).session(session);

        if (!receiverWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Receiver wallet not found.');
        }


        senderWallet.balance -= parsedAmount;
        receiverWallet.balance += parsedAmount;

        await senderWallet.save({ session });
        await receiverWallet.save({ session });


        const [sendTxn] = await Transaction.create([{
            wallet: senderWallet._id,
            senderId: new Types.ObjectId(senderUserId),
            receiverId: new Types.ObjectId(receiverId),
            amount: parsedAmount,
            type: TransactionType.SEND,
            note: `Money sent to user ID: ${receiverId}`,
        }], { session });

        await session.commitTransaction();

        return {
            message: 'Money sent successfully',
            senderWallet: senderWallet,
            receiverWallet: receiverWallet,
            transaction: sendTxn,
        };

    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};



const viewTransaction = async (payload: IGetTransactionsPayload) => {
    const { authenticatedUserId, role, query } = payload;

    let transactionQuery: Record<string, any> = {}; // This will hold our base query for transactions

    // Role-based filtering for transactions
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        // Admins/Super Admins can view all transactions or filter by a specific userId
        const targetUserId = query.userId; // Admin can provide a userId in query params

        if (targetUserId) {
            transactionQuery.$or = [
                { senderId: new Types.ObjectId(targetUserId) },
                { receiverId: new Types.ObjectId(targetUserId) }
            ];
        }
        // If no userId provided by Admin, transactionQuery remains empty, QueryBuilder will fetch all.
    }
    else if (role === 'USER') {
        // Users can only view their own transactions
        const targetUserId = query.userId; // User might provide their own ID, but we enforce it

        if (targetUserId && targetUserId !== authenticatedUserId) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view other users\' transaction history.');
        }
        transactionQuery.$or = [
            { senderId: new Types.ObjectId(authenticatedUserId) },
            { receiverId: new Types.ObjectId(authenticatedUserId) }
        ];
    } else {
        // If role is AGENT or any other role not explicitly handled here
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this transaction history.');
    }

    // Add type filter if provided in the original query
    if (query.type) {
        transactionQuery.type = query.type;
    }

    // Initialize QueryBuilder with the base query and the raw request query
    const transactionQueryBuilder = new QueryBuilder(
        Transaction.find(transactionQuery), // Start with our role-based filter
        query // Pass the raw query for search, sort, paginate, fields
    )
        .search(['note', 'type']) // Example searchable fields for transactions
        .filter() // Applies general filters from query (excluding specific ones)
        .sort()
        .fields()
        .paginate();

    const result = await transactionQueryBuilder.build().lean(); // Execute query and convert to plain JS objects
    const meta = await transactionQueryBuilder.getMeta(); // Get pagination metadata

    return {
        meta,
        data: result,
    };
};




export const WalletServices = {
    deposit,
    withdraw,
    sendMoney,
    viewTransaction
};

