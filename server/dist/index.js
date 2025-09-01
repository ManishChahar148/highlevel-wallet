import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connect } from './db.js';
import { walletRouter } from './routes/wallet.js';
import { txRouter } from './routes/transactions.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(walletRouter);
app.use(txRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(400).json({ message: err.message || 'Bad Request' });
});
const PORT = parseInt(process.env.PORT || '4000', 10);
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI).then(() => {
    app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
});
