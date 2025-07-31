import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import httpStatus from 'http-status-codes';
import { QueryBuilder } from "../../utils/queryBuilder";
import { Transaction } from "./transaction.model";
import { Role } from "../user/user.interface";



interface IGetTransactionsPayload {
    authenticatedUserId: string; // The ID of the currently authenticated user
    role: string; // The role of the authenticated user
    query: Record<string, string>; // The raw query object from req.query
}

// const viewTransaction = async (payload: IGetTransactionsPayload) => {
//     const { authenticatedUserId, role, query } = payload;

//     // --- REVISED, ROBUST LOGIC FOR /my-history ---

//     // 1. First, check for unauthorized roles.
//     if (role !== Role.USER && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
//         throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this transaction history.');
//     }

//     // 2. Build the query filter object from scratch.
//     const finalFilter: Record<string, any> = {};

//     // 3. The primary filter for this endpoint is ALWAYS the authenticated user's ID.
//     // This is the core fix. It cannot be overwritten.
//     finalFilter.$or = [
//         { senderId: new Types.ObjectId(authenticatedUserId) },
//         { receiverId: new Types.ObjectId(authenticatedUserId) }
//     ];

//     // 4. Prohibit attempts to view other users' history via 'userId' query param on THIS endpoint
//     const targetUserIdInQuery = query.userId;
//     if (targetUserIdInQuery && targetUserIdInQuery !== authenticatedUserId) {
//         throw new AppError(
//             httpStatus.FORBIDDEN,
//             'You are not authorized to view other users\' transaction history through this endpoint.'
//         );
//     }

//     // 5. Apply transaction type filter if present in the query
//     if (query.type) {
//         finalFilter.type = query.type;
//     }

//     // 6. Use the QueryBuilder with the finalFilter and other query parameters.
//     const transactionQueryBuilder = new QueryBuilder(
//         Transaction.find(finalFilter), // Pass the fully-formed filter
//         query // The query builder can still handle search, sort, paginate
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



const viewTransaction = async (payload: IGetTransactionsPayload) => {
    const { authenticatedUserId, role, query } = payload;

    // 1. Role-based authorization check for this endpoint
    if (![Role.USER, Role.ADMIN, Role.SUPER_ADMIN].includes(role as Role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this transaction history.');
    }

    // 2. Build the primary filter for the authenticated user's transactions.
    // This filter is constructed manually and explicitly, ensuring it's always applied.
    const finalFilter: Record<string, any> = {
        $or: [
            { senderId: new Types.ObjectId(authenticatedUserId) },
            { receiverId: new Types.ObjectId(authenticatedUserId) }
        ]
    };

    // 3. Prohibit attempts to view other users' history via 'userId' query param on THIS endpoint.
    // This prevents any user (including Admin/SuperAdmin) from bypassing the personal history rule.
    const targetUserIdInQuery = query.userId;
    if (targetUserIdInQuery && targetUserIdInQuery !== authenticatedUserId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to view other users\' transaction history through this endpoint.'
        );
    }

    // 4. Add transaction type filter if provided in the original query, directly to the final filter.
    if (query.type) {
        finalFilter.type = query.type;
    }

    // 5. Initialize QueryBuilder with the *fully constructed 'finalFilter'*.
    // CRITICAL: We are NOT calling .filter() on the QueryBuilder chain for this function,
    // because the filter is already applied in the Transaction.find() call.
    const transactionQueryBuilder = new QueryBuilder(
        Transaction.find(finalFilter), // Pass the complete filter here
        query // Pass the raw query for search, sort, paginate, fields
    )
        .search(['note', 'type']) // Apply search terms (note, type)
        // .filter() // <--- REMOVE THIS LINE! It's the source of the problem.
        .sort()                   // Apply sorting
        .fields()                 // Apply field selection
        .paginate();              // Apply pagination

    const [data, meta] = await Promise.all([
        transactionQueryBuilder.build().lean(),
        transactionQueryBuilder.getMeta()
    ]);

    return {
        meta,
        data,
    };
};



const getAllTransactions = async (query: Record<string, string>) => {

    const baseFilter: Record<string, any> = {};

    if (query.userId) {

        if (!Types.ObjectId.isValid(query.userId)) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid User ID format provided in query.');
        }
        baseFilter.$or = [
            { senderId: new Types.ObjectId(query.userId) },
            { receiverId: new Types.ObjectId(query.userId) }
        ];
    }

    if (query.type) {
        baseFilter.type = query.type;
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
    viewTransaction,
    getAllTransactions
};