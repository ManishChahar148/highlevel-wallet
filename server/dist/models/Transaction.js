import { Schema, model } from 'mongoose';
const TransactionSchema = new Schema({
    _id: { type: String, required: true },
    walletId: { type: String, required: true, index: true },
    amountUnits: { type: String, required: true },
    balanceUnits: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: () => new Date(), index: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true }
}, { versionKey: false, _id: false });
export const Transaction = model('Transaction', TransactionSchema);
