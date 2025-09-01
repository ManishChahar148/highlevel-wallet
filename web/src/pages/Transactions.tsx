// src/pages/Transactions.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions, getWallet, Wallet } from '../api';
import Papa from 'papaparse';

export default function Transactions() {
  const walletId = localStorage.getItem('selectedWalletId');
  const [walletInfo, setWalletInfo] = useState<Wallet | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [busy, setBusy] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!walletId) return;
    // Fetch wallet info
    getWallet(walletId)
      .then(setWalletInfo)
      .catch(() => setWalletInfo(null));
    // Fetch transactions
    setBusy(true);
    fetchTransactions(walletId, skip, limit)
      .then(response => {
        // Handle both old and new API response formats
        if (Array.isArray(response)) {
          // Old format - just an array of transactions
          setRows(response);
          setHasMore(true);
        } else {
          // New format - object with transactions and hasMore
          setRows(response.transactions || []);
          setHasMore(response.hasMore !== undefined ? response.hasMore : true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch transactions:', err);
        setRows([]);
        setHasMore(false);
      })
      .finally(() => setBusy(false));
  }, [walletId, skip, limit]);

  const sorted = useMemo(() => {
    const copy = [...(rows || [])];
    copy.sort((a, b) => {
      let va = sortKey === 'date' ? new Date(a.date).getTime() : a.amount;
      let vb = sortKey === 'date' ? new Date(b.date).getTime() : b.amount;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  async function exportCSV() {
    if (!walletId) return;
    setBusy(true);
    try {
      // pull up to 1000 records for export; adjust as needed
      const response = await fetchTransactions(walletId, 0, 1000);
      const all = response.transactions;
      const csv = Papa.unparse(all.map(r => ({
        id: r.id,
        walletId: r.walletId,
        amount: r.amount.toFixed(4),
        balance: r.balance.toFixed(4),
        description: r.description,
        date: r.date,
        type: r.type
      })));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${walletId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  if (!walletId) return (
    <div className="bg-white p-6 rounded-2xl shadow text-center">
      <p className="text-gray-600 mb-4">No wallet selected. Please select a wallet from the Home page.</p>
      <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go to Home</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Wallet Info Header */}
      {walletInfo && (
        <div className="bg-white p-4 rounded-2xl shadow">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Transactions for {walletInfo.name}</h2>
              <div className="text-sm text-gray-600 mt-1">
                Balance: <strong>{walletInfo.balance.toFixed(4)}</strong> | 
                ID: <code className="ml-2">{walletId}</code>
              </div>
            </div>
            <Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <button onClick={exportCSV} className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-900">Export CSV</button>
      </div>

      <div className="flex gap-4 items-center">
        <label>Sort by </label>
        <select className="border rounded p-2" value={sortKey} onChange={e => setSortKey(e.target.value as any)}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
        <select className="border rounded p-2" value={sortDir} onChange={e => setSortDir(e.target.value as any)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <label>Limit</label>
          <input type="number" min={1} max={100} className="border rounded p-2 w-24" value={limit} onChange={e => setLimit(parseInt(e.target.value || '10', 10))} />
          <button disabled={skip===0} onClick={() => setSkip(Math.max(0, skip - limit))} className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
          <button disabled={!hasMore} onClick={() => setSkip(skip + limit)} className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead>
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Description</th>
              <th className="p-3">ID</th>
            </tr>
          </thead>
          <tbody>
            {busy && (
              <tr><td className="p-3" colSpan={6}>Loading…</td></tr>
            )}
            {!busy && sorted.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{new Date(r.date).toLocaleString()}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.amount.toFixed(4)}</td>
                <td className="p-3">{r.balance.toFixed(4)}</td>
                <td className="p-3">{r.description}</td>
                <td className="p-3 text-xs text-gray-500">{r.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
