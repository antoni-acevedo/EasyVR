import React from 'react';
import { Ruler, Percent, Sparkles, Settings, Info } from 'lucide-react';

type Mode = 'fixed' | 'percent' | 'crf';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const items: { key: Mode; label: string; icon: React.ReactNode }[] = [
  { key: 'fixed', label: 'Fixed Size', icon: <Ruler size={16} /> },
  { key: 'percent', label: 'Percent', icon: <Percent size={16} /> },
  { key: 'crf', label: 'Quality', icon: <Sparkles size={16} /> },
];

export default function Sidebar({ mode, onChange }: Props) {
  return (
    <aside className="w-[260px] h-full bg-[#0c101d] border-r border-slate-900/50 p-5 flex flex-col justify-between flex-shrink-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-8 drag-region">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base"
               style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            E
          </div>
          <div>
            <div className="text-white font-semibold text-sm">EasyVR</div>
            <div className="text-slate-500 text-[10px]">Video Resizer</div>
          </div>
        </div>

        <div className="space-y-1">
          {items.map((item) => {
            const active = mode === item.key;
            return (
              <div
                key={item.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                  active
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
                onClick={() => onChange(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-sm border border-transparent">
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-sm border border-transparent">
          <Info size={16} />
          <span>About</span>
        </div>
      </div>
    </aside>
  );
}
