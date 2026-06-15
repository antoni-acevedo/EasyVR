import React from 'react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-800/50" style={{ background: 'var(--bg-input)' }}>
      <input
        className="flex-1 bg-transparent text-white text-base px-4 py-3 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center gap-1 px-4 border-l border-slate-800/50 text-slate-400 text-sm cursor-pointer">
        MB <span className="text-xs">▼</span>
      </div>
    </div>
  );
}
