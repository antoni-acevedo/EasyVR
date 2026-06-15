import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function PercentInput({ value, onChange }: Props) {
  return (
    <div>
      <input type="range" min={10} max={90} step={5} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full" />
      <div className="flex justify-between mt-1">
        <span className="text-[11px] text-slate-500">10%</span>
        <span className="text-sm font-semibold text-indigo-400">{value}%</span>
        <span className="text-[11px] text-slate-500">90%</span>
      </div>
    </div>
  );
}
