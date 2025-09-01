// src/api.ts
const API_BASE: string = (window as any).API_BASE || 'http://localhost:4000';

export type Wallet = { id: string; balance: number; name: string; date: string };
export type Tx = {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  description: string;
  date: string;
  type: 'CREDIT' | 'DEBIT';
};

export async function setupWallet(name: string, balance?: number) {
  const res = await fetch(`${API_BASE}/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(balance !== undefined ? { name, balance } : { name })
  });
  if (!res.ok) throw new Error('Failed to setup wallet');
  return res.json();
}

export async function getWallet(id: string): Promise<Wallet> {
  const res = await fetch(`${API_BASE}/wallet/${id}`);
  if (!res.ok) throw new Error('Wallet not found');
  return res.json();
}

export async function transact(walletId: string, amount: number, description: string) {
  const res = await fetch(`${API_BASE}/transact/${walletId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, description })
  });
  if (!res.ok) throw new Error('Transaction failed');
  return res.json();
}

export async function fetchTransactions(walletId: string, skip = 0, limit = 25): Promise<{ transactions: Tx[], hasMore: boolean }> {
  const url = new URL(`${API_BASE}/transactions`);
  url.searchParams.set('walletId', walletId);
  url.searchParams.set('skip', String(skip));
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load transactions');
  return res.json();
}

export async function getAllWallets(): Promise<Wallet[]> {
  const res = await fetch(`${API_BASE}/wallets`);
  if (!res.ok) throw new Error('Failed to fetch wallets');
  return res.json();
}
