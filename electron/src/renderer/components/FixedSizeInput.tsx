import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="bg-[#070a14] border border-slate-800 rounded-lg flex items-center h-12 overflow-hidden focus-within:border-indigo-500 transition-colors">
      <input
        className="flex-1 bg-transparent px-4 py-2 text-white outline-none text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="h-full bg-[#0d111f] border-l border-slate-800 px-4 flex items-center text-slate-400 text-sm gap-2 cursor-pointer hover:text-white transition-colors">
        MB <ChevronDown size={14} />
      </div>
    </div>
  );
}
