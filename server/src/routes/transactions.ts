import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { parseAmountToUnits, format4 } from '../utils/money.js';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
export const txRouter = Router();

// POST /transact/:walletId
// Body: { amount, description }
// For Credit amount > 0, for Debit amount < 0

txRouter.post('/transact/:walletId', async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const schema = z.object({
      amount: z.number().or(z.string()),
      description: z.string().optional().default('')
    });
    const { amount, description } = schema.parse(req.body);

    const deltaUnits = parseAmountToUnits(amount);
    const type = deltaUnits >= 0n ? 'CREDIT' : 'DEBIT';

    const session = await mongoose.startSession();
    let newBalanceUnits = 0n;
    let txId = '';

    await session.withTransaction(async () => {
      const wallet = await Wallet.findById(walletId).session(session);
      if (!wallet) throw new Error('Wallet not found');

      const current = BigInt(wallet.balanceUnits);
      newBalanceUnits = current + deltaUnits; // negative balance is allowed per spec

      // Update wallet balance
      wallet.balanceUnits = newBalanceUnits.toString();
      await wallet.save({ session });

      // Create transaction
      txId = nanoid();
      await Transaction.create([
        {
          _id: txId,
          walletId,
          amountUnits: deltaUnits.toString(),
          balanceUnits: newBalanceUnits.toString(),
          description,
          type,
          date: new Date()
        }
      ], { session });
    });

    session.endSession();

    return res.status(200).json({
      balance: Number(format4(newBalanceUnits)),
      transactionId: txId
    });
  } catch (err) {
    next(err);
  }
});

// GET /transactions?walletId=...&skip=...&limit=...

txRouter.get('/transactions', async (req, res, next) => {
  try {
    const schema = z.object({
      walletId: z.string().min(1),
      skip: z.string().optional(),
      limit: z.string().optional()
    });
    const { walletId, skip = '0', limit = '25' } = schema.parse(req.query);
    const s = Math.max(0, parseInt(skip as string, 10) || 0);
    const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

    const txs = await Transaction.find({ walletId })
      .sort({ date: -1, _id: -1 })
      .skip(s)
      .limit(l + 1) // Fetch one extra to check if there are more
      .lean();

    const hasMore = txs.length > l;
    const transactions = txs.slice(0, l); // Return only the requested limit

    const result = transactions.map(t => ({
      id: t._id,
      walletId: t.walletId,
      amount: Number(format4(BigInt(t.amountUnits))),
      balance: Number(format4(BigInt(t.balanceUnits))),
      description: t.description,
      date: t.date,
      type: t.type
    }));

    return res.status(200).json({ transactions: result, hasMore });
  } catch (err) {
    next(err);
  }
});
