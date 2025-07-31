import { Types } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  CASH_IN = 'CASH_IN',   // agent to user
  CASH_OUT = 'CASH_OUT', // agent from user
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ITransaction {
  wallet: Types.ObjectId;
  senderId?: Types.ObjectId; // who initiated the transaction
  receiverId?: Types.ObjectId; // who received (if any)
  amount: number;
  type: TransactionType;
  note?: string;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}