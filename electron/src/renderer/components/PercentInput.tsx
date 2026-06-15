import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function PercentInput({ value, onChange }: Props) {
  return (
    <div className="mb-1">
      <label className="text-[11px] font-semibold block mb-[5px]" style={{ color: 'var(--text-secondary)' }}>COMPRESSION RATIO</label>
      <input type="range" min={10} max={90} step={5} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full accent-[var(--accent)]" />
      <div className="flex justify-between mt-[2px]">
        <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>10%</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{value}%</span>
        <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>90%</span>
      </div>
    </div>
  );
}
