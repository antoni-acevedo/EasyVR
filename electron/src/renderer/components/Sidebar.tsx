import React from 'react';
import { Settings, Info } from 'lucide-react';

type Mode = 'fixed' | 'percent' | 'crf';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const items: { key: Mode; label: string }[] = [
  { key: 'fixed', label: 'Fixed Size' },
  { key: 'percent', label: 'Percent' },
  { key: 'crf', label: 'Quality' },
];

export default function Sidebar({ mode, onChange }: Props) {
  return (
    <div className="w-72 flex flex-col justify-between p-6 border-r border-[#1E293B]/50" style={{ background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-8 drag-region">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
               style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            E
          </div>
          <div>
            <div className="text-white font-semibold text-lg">EasyVR</div>
            <div className="text-slate-400 text-xs">Video Resizer</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.key}
              className={`sidebar-item ${mode === item.key ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              onClick={() => onChange(item.key)}
            >
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1">
        <div className="sidebar-item sidebar-item-inactive">
          <Settings size={16} />
          <span className="text-xs">Settings</span>
        </div>
        <div className="sidebar-item sidebar-item-inactive">
          <Info size={16} />
          <span className="text-xs">About</span>
        </div>
      </div>
    </div>
  );
}
