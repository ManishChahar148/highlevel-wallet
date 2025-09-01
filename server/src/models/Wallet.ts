import { Schema, model } from 'mongoose';

export interface WalletDoc {
  _id: string; // string id for simplicity
  name: string;
  balanceUnits: string; // integer micro-units stored as string
  createdAt: Date;
}

const WalletSchema = new Schema<WalletDoc>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  // Store as String to preserve bigint in Mongo (or use Decimal128). We'll serialize manually.
  balanceUnits: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() }
}, { versionKey: false, _id: false });

WalletSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

export const Wallet = model<WalletDoc>('Wallet', WalletSchema);
