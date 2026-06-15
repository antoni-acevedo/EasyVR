import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function CRFInput({ value, onChange }: Props) {
  return (
    <div>
      <div className="text-[11px] text-slate-500 mb-2">18 = best / 28 = smallest</div>
      <input type="range" min={18} max={28} step={1} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full" />
      <div className="flex justify-between mt-1">
        <span className="text-[11px] text-slate-500">Best</span>
        <span className="text-sm font-semibold text-indigo-400">CRF {value}</span>
        <span className="text-[11px] text-slate-500">Smaller</span>
      </div>
    </div>
  );
}
