import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function CRFInput({ value, onChange }: Props) {
  return (
    <div className="mb-1">
      <label className="text-[11px] font-semibold block mb-[2px]" style={{ color: 'var(--text-secondary)' }}>QUALITY (CRF)</label>
      <span className="text-[10px] block mb-[4px]" style={{ color: 'var(--text-light)' }}>18 = best quality / 28 = smallest file</span>
      <input type="range" min={18} max={28} step={1} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full accent-[var(--accent)]" />
      <div className="flex justify-between mt-[2px]">
        <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Best</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>CRF {value}</span>
        <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>Smaller</span>
      </div>
    </div>
  );
}
