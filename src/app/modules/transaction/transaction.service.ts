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
const viewMyTransactionHistory = async (userId: string,query: Record<string, string>) => {

    const filterQuery: Record<string, any> = {
        $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
        ],
    };

    
    if (query.type) filterQuery.type = query.type;

    const queryBuilder = new QueryBuilder(Transaction.find(filterQuery), query)
        .sort()
        .filter()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build().lean(),
        queryBuilder.getMeta(),
    ]);

    return { data, meta };
};



// get All Transactions
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
    viewMyTransactionHistory,
    getAllTransactions
};