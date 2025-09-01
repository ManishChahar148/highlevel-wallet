// src/App.tsx
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <nav className="text-blue-600 underline flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/transactions">Transactions</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </div>
  );
}
