// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

// Lazy imports
const Home = lazy(() => import('./pages/Home'));
const Transactions = lazy(() => import('./pages/Transactions'));

export default function App() {
  return (
    <div className="max-w-3xl p-4 mx-auto">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <nav className="flex gap-4 text-blue-600 underline">
          <Link to="/">Home</Link>
          <Link to="/transactions">Transactions</Link>
        </nav>
      </header>

      {/* Suspense wraps the lazy components */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </Suspense>
    </div>
  );
}
