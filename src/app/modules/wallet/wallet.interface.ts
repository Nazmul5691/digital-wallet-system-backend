import { Types } from 'mongoose';
import { IsActive } from '../user/user.interface';


export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId; 
  balance: number;
  status: IsActive; 
  createdAt?: Date;
  updatedAt?: Date;
}