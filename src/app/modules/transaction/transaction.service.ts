import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import httpStatus from 'http-status-codes';
import { QueryBuilder } from "../../utils/queryBuilder";
import { Transaction } from "./transaction.model";



interface IGetTransactionsPayload {
    authenticatedUserId: string; 
    role: string; 
    query: Record<string, string>; 
}


const viewTransaction = async (payload: IGetTransactionsPayload) => {
    const { authenticatedUserId, role, query } = payload;

    let transactionQuery: Record<string, any> = {}; 

    
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        
        const targetUserId = query.userId;

        if (targetUserId) {
            transactionQuery.$or = [
                { senderId: new Types.ObjectId(targetUserId) },
                { receiverId: new Types.ObjectId(targetUserId) }
            ];
        }
       
    }
    else if (role === 'USER') {
       
        const targetUserId = query.userId; 

        if (targetUserId && targetUserId !== authenticatedUserId) {
            throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view other users\' transaction history.');
        }
        transactionQuery.$or = [
            { senderId: new Types.ObjectId(authenticatedUserId) },
            { receiverId: new Types.ObjectId(authenticatedUserId) }
        ];
    } else {
        
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this transaction history.');
    }

    
    if (query.type) {
        transactionQuery.type = query.type;
    }

    const transactionQueryBuilder = new QueryBuilder(
        Transaction.find(transactionQuery),
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
    viewTransaction
};