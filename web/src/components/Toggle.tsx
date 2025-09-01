// src/components/Toggle.tsx
import React from 'react';

type Props = {
  checked: boolean;
  onChange: (val: boolean) => void;
  left: string;
  right: string;
};

export default function Toggle({ checked, onChange, left, right }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={!checked ? 'font-semibold' : ''}>{left}</span>
      <button
        className={`w-12 h-6 rounded-full p-1 transition bg-gray-300 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
        onClick={() => onChange(!checked)}
        aria-label="toggle"
      >
        <div className={`w-4 h-4 bg-white rounded-full transition ${checked ? 'translate-x-6' : ''}`}></div>
      </button>
      <span className={checked ? 'font-semibold' : ''}>{right}</span>
    </div>
  );
}
