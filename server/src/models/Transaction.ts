import { Schema, model } from 'mongoose';

export type TxType = 'CREDIT' | 'DEBIT';

export interface TransactionDoc {
  _id: string; // transaction id
  walletId: string;
  amountUnits: string; // signed, stored as string
  balanceUnits: string; // balance after tx, stored as string
  description: string;
  date: Date;
  type: TxType;
}

const TransactionSchema = new Schema<TransactionDoc>({
  _id: { type: String, required: true },
  walletId: { type: String, required: true, index: true },
  amountUnits: { type: String, required: true },
  balanceUnits: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: () => new Date(), index: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true }
}, { versionKey: false, _id: false });

export const Transaction = model<TransactionDoc>('Transaction', TransactionSchema);
