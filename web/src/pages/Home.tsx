// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Toggle from '../components/Toggle';
import { getWallet, setupWallet, transact, getAllWallets, Wallet } from '../api';

export default function Home() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(localStorage.getItem('selectedWalletId'));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [walletName, setWalletName] = useState<string>('');

  const [amount, setAmount] = useState('');
  const [isCredit, setIsCredit] = useState(true);
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (selectedWalletId) {
      localStorage.setItem('selectedWalletId', selectedWalletId);
      getWallet(selectedWalletId)
        .then(w => { setBalance(w.balance); setWalletName(w.name); })
        .catch(() => { setSelectedWalletId(null); });
    } else {
      localStorage.removeItem('selectedWalletId');
    }
  }, [selectedWalletId]);

  async function loadWallets() {
    try {
      const allWallets = await getAllWallets();
      setWallets(allWallets);
    } catch (e) {
      console.error('Failed to load wallets');
    }
  }

  async function onSetup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const bal = initialBalance.trim() === '' ? undefined : Number(initialBalance);
      const res = await setupWallet(name, bal);
      setSelectedWalletId(res.id);
      setBalance(res.balance);
      setWalletName(res.name);
      setShowCreateForm(false);
      setName('');
      setInitialBalance('');
      await loadWallets();
    } catch (e) {
      alert('Failed to setup wallet');
    } finally {
      setBusy(false);
    }
  }

  async function onTransact(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWalletId) return;
    const amt = Number(amount || '0');
    if (!amt || amt <= 0) return alert('Enter an amount > 0');
    setBusy(true);
    try {
      const signed = isCredit ? amt : -amt;
      const res = await transact(selectedWalletId, signed, desc);
      setBalance(res.balance);
      setAmount('');
      setDesc('');
      await loadWallets();
    } catch (e) {
      alert('Transaction failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Wallet List */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Wallets</h2>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Wallet
          </button>
        </div>
        
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map(wallet => (
              <div 
                key={wallet.id} 
                onClick={() => setSelectedWalletId(wallet.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedWalletId === wallet.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">{wallet.name}</div>
                <div className="text-sm text-gray-600 mt-1">Balance: {wallet.balance.toFixed(4)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No wallets found. Create your first wallet!</p>
        )}
      </div>

      {/* Create Wallet Form */}
      {showCreateForm && (
        <form onSubmit={onSetup} className="space-y-4 bg-white p-4 rounded-2xl shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create Wallet</h2>
            <button 
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div>
            <label className="block text-sm">Username</label>
            <input className="border rounded p-2 w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm">Initial Balance (optional)</label>
            <input className="border rounded p-2 w-full" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="0.0000" />
          </div>
          <button disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{busy ? 'Working…' : 'Submit'}</button>
        </form>
      )}

      {/* Selected Wallet Details and Transaction Form */}
      {selectedWalletId && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Selected Wallet</h2>
                <div className="mt-2 text-gray-700">ID: <code>{selectedWalletId}</code></div>
                <div className="mt-1">Name: <strong>{walletName}</strong></div>
                <div className="mt-1">Balance: <strong>{balance?.toFixed(4)}</strong></div>
              </div>
              <Link 
                to="/transactions" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Transactions
              </Link>
            </div>
          </div>

          <form onSubmit={onTransact} className="space-y-4 bg-white p-4 rounded-2xl shadow">
            <h3 className="text-lg font-semibold">New Transaction</h3>
            <div>
              <label className="block text-sm">Amount</label>
              <input className="border rounded p-2 w-full" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10.1234" />
            </div>
            <div className="flex items-center gap-3">
              <Toggle checked={isCredit} onChange={setIsCredit} left="DEBIT" right="CREDIT" />
            </div>
            <div>
              <label className="block text-sm">Description</label>
              <input className="border rounded p-2 w-full" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Recharge" />
            </div>
            <button disabled={busy} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{busy ? 'Working…' : 'Submit'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
