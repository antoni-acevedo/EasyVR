import React from 'react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="mb-1">
      <label className="text-[11px] font-semibold block mb-[5px]" style={{ color: 'var(--text-secondary)' }}>TARGET SIZE</label>
      <div className="flex">
        <input
          className="h-9 text-sm px-3 border border-[var(--border)] rounded-l outline-none flex-1"
          style={{ background: 'white' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="bg-[#F4F4F4] h-9 w-14 flex items-center justify-center rounded-r text-sm ml-[-1px]" style={{ color: 'var(--text-secondary)' }}>
          MB
        </div>
      </div>
    </div>
  );
}
