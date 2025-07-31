
import { Transaction } from '../transaction/transaction.model';
import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status-codes';
import { TransactionStatus, TransactionType } from '../transaction/transaction.interface';
import AppError from '../../errorHelpers/appError';
import { Wallet } from './wallet.model';
import { QueryBuilder } from '../../utils/queryBuilder';
import { IsActive } from '../user/user.interface';




// add money
const deposit = async (payload: { userId: string; amount: number | string }) => {
    const { userId, amount } = payload;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0');
    }

    const session = await mongoose.startSession();
    let pendingTransactionId: Types.ObjectId | null = null;

    try {
        session.startTransaction();


        const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) }).session(session);

        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
        }


        const [pendingTransaction] = await Transaction.create([{
            wallet: wallet._id,
            senderId: new Types.ObjectId(userId),
            receiverId: new Types.ObjectId(userId),
            amount: parsedAmount,
            type: TransactionType.DEPOSIT,
            note: 'Wallet top-up',
            status: TransactionStatus.PENDING,
        }], { session });

        pendingTransactionId = pendingTransaction._id;


        wallet.balance += parsedAmount;
        await wallet.save({ session });


        const updatedTransaction = await Transaction.findByIdAndUpdate(
            pendingTransactionId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );


        await session.commitTransaction();

        return {
            message: 'Deposit successful',
            wallet,
            transaction: updatedTransaction,
        };

    } catch (error) {
        await session.abortTransaction();

        if (pendingTransactionId) {
            await Transaction.findByIdAndUpdate(
                pendingTransactionId,
                { status: TransactionStatus.FAILED }
            );
        }

        throw error;
    } finally {
        session.endSession();
    }
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

    const session = await mongoose.startSession();
    let pendingTransactionId: Types.ObjectId | null = null;

    try {
        session.startTransaction();


        const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) }).session(session);

        if (!wallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found.');
        }

        if (wallet.balance < parsedAmount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance.');
        }


        const [pendingTransaction] = await Transaction.create([{
            wallet: wallet._id,
            senderId: new Types.ObjectId(userId),
            receiverId: new Types.ObjectId(userId),
            amount: parsedAmount,
            type: TransactionType.WITHDRAW,
            note: 'Wallet withdrawal',
            status: TransactionStatus.PENDING,
        }], { session });

        pendingTransactionId = pendingTransaction._id;


        wallet.balance -= parsedAmount;
        await wallet.save({ session });


        const updatedTransaction = await Transaction.findByIdAndUpdate(
            pendingTransactionId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );


        await session.commitTransaction();

        return {
            message: 'Withdrawal successful',
            wallet,
            transaction: updatedTransaction,
        };

    } catch (error) {

        await session.abortTransaction();


        if (pendingTransactionId) {
            await Transaction.findByIdAndUpdate(
                pendingTransactionId,
                { status: TransactionStatus.FAILED }
            );
        }
        throw error;
    } finally {
        session.endSession();
    }
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
    if (!receiverId || !Types.ObjectId.isValid(receiverId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Receiver ID.');
    }
    if (receiverId.toString() === senderUserId.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cannot send money to yourself.');
    }

    const session = await mongoose.startSession();
    let pendingTransactionId: Types.ObjectId | null = null;

    try {
        session.startTransaction();


        const senderWallet = await Wallet.findOne({ userId: new Types.ObjectId(senderUserId) }).session(session);
        if (!senderWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Sender wallet not found.');
        }

        if (senderWallet.balance < parsedAmount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance.');
        }

        const receiverWallet = await Wallet.findOne({ userId: new Types.ObjectId(receiverId) }).session(session);
        if (!receiverWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Receiver wallet not found.');
        }


        const [pendingTransaction] = await Transaction.create([{
            wallet: senderWallet._id,
            senderId: new Types.ObjectId(senderUserId),
            receiverId: new Types.ObjectId(receiverId),
            amount: parsedAmount,
            type: TransactionType.SEND,
            note: `Money sent to user ID: ${receiverId}`,
            status: TransactionStatus.PENDING,
        }], { session });

        pendingTransactionId = pendingTransaction._id;


        senderWallet.balance -= parsedAmount;
        receiverWallet.balance += parsedAmount;
        await senderWallet.save({ session });
        await receiverWallet.save({ session });


        const updatedTransaction = await Transaction.findByIdAndUpdate(
            pendingTransactionId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );

        await session.commitTransaction();

        return {
            message: 'Money sent successfully',
            senderWallet: senderWallet,
            receiverWallet: receiverWallet,
            transaction: updatedTransaction,
        };

    } catch (error) {
        await session.abortTransaction();


        if (pendingTransactionId) {
            await Transaction.findByIdAndUpdate(
                pendingTransactionId,
                { status: TransactionStatus.FAILED }
            );
        }
        throw error;
    } finally {
        session.endSession();
    }
};


// cash in
const cashIn = async (payload: { agentUserId: string; targetUserId: string; amount: number | string; role: string }) => {
    const { agentUserId, targetUserId, amount, role } = payload;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0.');
    }
    if (role !== 'AGENT') {
        throw new AppError(httpStatus.FORBIDDEN, 'Only agents are allowed to perform cash-in operations.');
    }
    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Target User ID format.');
    }
    if (targetUserId.toString() === agentUserId.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Agents cannot cash-in to their own wallet via this operation. Use deposit instead.');
    }

    const session = await mongoose.startSession();
    let cashInTxnId: Types.ObjectId | null = null;
    let agentWithdrawTxnId: Types.ObjectId | null = null;

    try {
        session.startTransaction();

        const agentWallet = await Wallet.findOne({ userId: new Types.ObjectId(agentUserId) }).session(session);
        if (!agentWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Agent wallet not found. Please ensure the agent has a wallet.');
        }

        if (agentWallet.balance < parsedAmount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Agent has insufficient balance to perform this cash-in.');
        }

        const targetUserWallet = await Wallet.findOne({ userId: new Types.ObjectId(targetUserId) }).session(session);
        if (!targetUserWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Target user or their wallet not found.');
        }


        const [cashInTxn, agentWithdrawTxn] = await Transaction.create([
            {
                wallet: targetUserWallet._id,
                senderId: new Types.ObjectId(agentUserId),
                receiverId: new Types.ObjectId(targetUserId),
                amount: parsedAmount,
                type: TransactionType.CASH_IN,
                note: `Cash-in of ${parsedAmount} by agent ${agentUserId} to user ${targetUserId}`,
                status: TransactionStatus.PENDING,
            },
            {
                wallet: agentWallet._id,
                senderId: new Types.ObjectId(agentUserId),
                receiverId: new Types.ObjectId(targetUserId),
                amount: parsedAmount,
                type: TransactionType.WITHDRAW,
                note: `Money cashed out for user ${targetUserId} by agent`,
                status: TransactionStatus.PENDING,
            }
        ], { session, ordered: true });

        cashInTxnId = cashInTxn._id;
        agentWithdrawTxnId = agentWithdrawTxn._id;

        agentWallet.balance -= parsedAmount;
        await agentWallet.save({ session });
        targetUserWallet.balance += parsedAmount;
        await targetUserWallet.save({ session });


        const updatedCashInTxn = await Transaction.findByIdAndUpdate(
            cashInTxnId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );
        await Transaction.findByIdAndUpdate(
            agentWithdrawTxnId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );

        await session.commitTransaction();

        return {
            message: 'Cash-in successful',
            agentWallet: agentWallet,
            targetUserWallet: targetUserWallet,
            transaction: updatedCashInTxn,
        };

    } catch (error) {
        await session.abortTransaction();

        if (cashInTxnId) {
            await Transaction.findByIdAndUpdate(cashInTxnId, { status: TransactionStatus.FAILED });
        }
        if (agentWithdrawTxnId) {
            await Transaction.findByIdAndUpdate(agentWithdrawTxnId, { status: TransactionStatus.FAILED });
        }
        throw error;
    } finally {
        session.endSession();
    }
};


// cash out
const cashOut = async (payload: { agentUserId: string; targetUserId: string; amount: number | string; role: string }) => {
    const { agentUserId, targetUserId, amount, role } = payload;
    const parsedAmount = Number(amount);


    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be a valid number greater than 0.');
    }
    if (role !== 'AGENT') {
        throw new AppError(httpStatus.FORBIDDEN, 'Only agents are allowed to perform cash-out operations.');
    }
    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Target User ID format.');
    }
    if (targetUserId.toString() === agentUserId.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Agents cannot cash-out from their own wallet using this operation. Use withdraw instead.');
    }

    const session = await mongoose.startSession();
    let cashOutTxnId: Types.ObjectId | null = null;
    let agentDepositTxnId: Types.ObjectId | null = null;

    try {
        session.startTransaction();


        const agentWallet = await Wallet.findOne({ userId: new Types.ObjectId(agentUserId) }).session(session);
        if (!agentWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Agent wallet not found. Please ensure the agent has a wallet.');
        }

        const targetUserWallet = await Wallet.findOne({ userId: new Types.ObjectId(targetUserId) }).session(session);
        if (!targetUserWallet) {
            throw new AppError(httpStatus.NOT_FOUND, 'Target user or their wallet not found.');
        }

        if (targetUserWallet.balance < parsedAmount) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Target user has insufficient balance for this cash-out.');
        }


        const [cashOutTxn, agentDepositTxn] = await Transaction.create([

            {
                wallet: targetUserWallet._id,
                senderId: new Types.ObjectId(targetUserId),
                receiverId: new Types.ObjectId(agentUserId),
                amount: parsedAmount,
                type: TransactionType.CASH_OUT,
                note: `Cash-out of ${parsedAmount} by agent ${agentUserId} from user ${targetUserId}`,
                status: TransactionStatus.PENDING,
            },

            {
                wallet: agentWallet._id,
                senderId: new Types.ObjectId(targetUserId),
                receiverId: new Types.ObjectId(agentUserId),
                amount: parsedAmount,
                type: TransactionType.DEPOSIT,
                note: `Money cashed in from user ${targetUserId} by agent`,
                status: TransactionStatus.PENDING,
            }
        ], { session, ordered: true });

        cashOutTxnId = cashOutTxn._id;
        agentDepositTxnId = agentDepositTxn._id;


        targetUserWallet.balance -= parsedAmount;
        await targetUserWallet.save({ session });
        agentWallet.balance += parsedAmount;
        await agentWallet.save({ session });



        const updatedCashOutTxn = await Transaction.findByIdAndUpdate(
            cashOutTxnId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );
        await Transaction.findByIdAndUpdate(
            agentDepositTxnId,
            { status: TransactionStatus.COMPLETED },
            { new: true, session }
        );

        await session.commitTransaction();

        return {
            message: 'Cash-out successful',
            agentWallet: agentWallet,
            targetUserWallet: targetUserWallet,
            transaction: updatedCashOutTxn,
        };

    } catch (error) {
        await session.abortTransaction();


        if (cashOutTxnId) {
            await Transaction.findByIdAndUpdate(cashOutTxnId, { status: TransactionStatus.FAILED });
        }
        if (agentDepositTxnId) {
            await Transaction.findByIdAndUpdate(agentDepositTxnId, { status: TransactionStatus.FAILED });
        }
        throw error;
    } finally {
        session.endSession();
    }
};




// get all wallets
const getAllWallets = async (query: Record<string, string>) => {

    const walletSearchableFields: any = [];

    const queryBuilder = new QueryBuilder(
        Wallet.find().populate('userId'),
        query
    )
        .search(walletSearchableFields)
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


const updateWalletStatus = async (walletId: string, status: IsActive) => {

    if (status !== IsActive.BLOCKED && status !== IsActive.ACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status provided. Status must be "BLOCKED" or "ACTIVE".');
    }

    const wallet = await Wallet.findById(walletId);

    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found.');
    }


    wallet.status = status;
    await wallet.save();


    return wallet;
};




export const WalletServices = {
    deposit,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getAllWallets,
    updateWalletStatus
};

