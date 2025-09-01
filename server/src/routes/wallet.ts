import { Router } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { parseAmountToUnits, format4 } from '../utils/money.js';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
export const walletRouter = Router();

// POST /setup
walletRouter.post('/setup', async (req, res, next) => {
  try {
    const schema = z.object({
      balance: z.number().or(z.string()).optional(),
      name: z.string().min(1)
    });
    const { balance = 0, name } = schema.parse(req.body);
    const balanceUnits = parseAmountToUnits(balance);

    const walletId = nanoid();
    const session = await mongoose.startSession();
    let txId = '';

    await session.withTransaction(async () => {
      await Wallet.create([{ _id: walletId, name, balanceUnits: balanceUnits.toString() }], { session });
      const type = balanceUnits >= 0n ? 'CREDIT' : 'DEBIT';
      txId = nanoid();
      await Transaction.create([
        {
          _id: txId,
          walletId,
          amountUnits: balanceUnits.toString(),
          balanceUnits: balanceUnits.toString(),
          description: 'Setup',
          type,
          date: new Date()
        }
      ], { session });
    });

    session.endSession();

    return res.status(200).json({
      id: walletId,
      balance: Number(format4(balanceUnits)),
      transactionId: txId,
      name,
      date: new Date()
    });
  } catch (err) {
    next(err);
  }
});

// GET /wallets
walletRouter.get('/wallets', async (req, res, next) => {
  try {
    const wallets = await Wallet.find({}).lean();
    const formattedWallets = wallets.map(wallet => ({
      id: wallet._id,
      balance: Number(format4(BigInt(wallet.balanceUnits))),
      name: wallet.name,
      date: wallet.createdAt
    }));
    return res.status(200).json(formattedWallets);
  } catch (err) {
    next(err);
  }
});

// GET /wallet/:id
walletRouter.get('/wallet/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const wallet = await Wallet.findById(id).lean();
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    return res.status(200).json({
      id: wallet._id,
      balance: Number(format4(BigInt(wallet.balanceUnits))),
      name: wallet.name,
      date: wallet.createdAt
    });
  } catch (err) {
    next(err);
  }
});
