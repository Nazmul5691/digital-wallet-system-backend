/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import httpStatus from 'http-status-codes';
import { QueryBuilder } from "../../utils/queryBuilder";
import { Transaction } from "./transaction.model";



// interface IGetTransactionsPayload {
//     authenticatedUserId: string; 
//     role: string; 
//     query: Record<string, string>; 
// }



// view My Transaction History
// const viewMyTransactionHistory = async (userId: string,query: Record<string, string>) => {

//     const filterQuery: Record<string, any> = {
//         $or: [
//             { senderId: new Types.ObjectId(userId) },
//             { receiverId: new Types.ObjectId(userId) },
//         ],
//     };


//     if (query.type) filterQuery.type = query.type;

//     const queryBuilder = new QueryBuilder(Transaction.find(filterQuery), query)
//         .sort()
//         .filter()
//         .paginate();

//     const [data, meta] = await Promise.all([
//         queryBuilder.build().lean(),
//         queryBuilder.getMeta(),
//     ]);

//     return { data, meta };
// };

const viewMyTransactionHistory = async (userId: string, query: Record<string, string>): Promise<any> => {
    const filterQuery: Record<string, any> = {
        $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
        ],
    };

    if (query.type && query.type !== 'all') {
        filterQuery.type = query.type;
    }

    if (query.startDate || query.endDate) {
        filterQuery.createdAt = {};

        if (query.startDate) {
            const start = new Date(query.startDate);
            // Sets the start of the day in UTC, e.g., '2025-08-22T00:00:00.000Z'
            start.setUTCHours(0, 0, 0, 0);
            filterQuery.createdAt.$gte = start;
        }

        if (query.endDate) {
            const end = new Date(query.endDate);
            // Sets the end of the day in UTC, e.g., '2025-08-22T23:59:59.999Z'
            end.setUTCHours(23, 59, 59, 999);
            filterQuery.createdAt.$lte = end;
        }
    }

    // const queryBuilder = new QueryBuilder(Transaction.find(filterQuery), query)
    //     .sort()
    //     .filter()
    //     .paginate();

    // const queryBuilder = new QueryBuilder(
    //     Transaction.find(filterQuery).populate("senderId receiverId", "name"),
    //     query
    // )
    //     .sort()
    //     .filter()
    //     .paginate();

    const queryBuilder = new QueryBuilder(
        Transaction.find(filterQuery)
            .populate("senderId", "name email role")
            .populate("receiverId", "name email role"),
        query
    )
        .sort()
        .filter()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build().lean(),
        queryBuilder.getMeta(),
    ]);

    return { data, meta };
};



// // get All Transactions
// const getAllTransactions = async (query: Record<string, string>) => {

//     const baseFilter: Record<string, any> = {};

//     if (query.userId) {

//         if (!Types.ObjectId.isValid(query.userId)) {
//             throw new AppError(httpStatus.BAD_REQUEST, 'Invalid User ID format provided in query.');
//         }
//         baseFilter.$or = [
//             { senderId: new Types.ObjectId(query.userId) },
//             { receiverId: new Types.ObjectId(query.userId) }
//         ];
//     }

//     if (query.type) {
//         baseFilter.type = query.type;
//     }


//     const transactionQueryBuilder = new QueryBuilder(
//         Transaction.find(baseFilter),
//         query
//     )
//         .search(['note', 'type'])
//         .filter()
//         .sort()
//         .fields()
//         .paginate();

//     const [data, meta] = await Promise.all([
//         transactionQueryBuilder.build().lean(),
//         transactionQueryBuilder.getMeta()
//     ]);

//     return {
//         meta,
//         data,
//     };
// };

// get All Transactions
const getAllTransactions = async (query: Record<string, string>) => {
    const baseFilter: Record<string, any> = {};

    // Filter by userId
    if (query.userId) {
        if (!Types.ObjectId.isValid(query.userId)) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid User ID format provided in query.');
        }
        baseFilter.$or = [
            { senderId: new Types.ObjectId(query.userId) },
            { receiverId: new Types.ObjectId(query.userId) }
        ];
    }

    // Filter by type
    if (query.type) {
        baseFilter.type = query.type;
    }

    // Filter by status
    if (query.status) {
        baseFilter.status = query.status;
    }

    // Filter by amount range
    if (query.minAmount || query.maxAmount) {
        baseFilter.amount = {};
        if (query.minAmount) baseFilter.amount.$gte = Number(query.minAmount);
        if (query.maxAmount) baseFilter.amount.$lte = Number(query.maxAmount);
    }

    const transactionQueryBuilder = new QueryBuilder(
        Transaction.find(baseFilter),
        query
    )
        .search(['note', 'type'])
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        transactionQueryBuilder.build().lean(),
        transactionQueryBuilder.getMeta()
    ]);

    return {
        meta,
        data,
    };
};





export const TransactionServices = {
    viewMyTransactionHistory,
    getAllTransactions
};