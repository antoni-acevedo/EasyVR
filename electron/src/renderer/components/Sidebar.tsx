import React from 'react';
import { Ruler, Percent, Sparkles, Settings, Info } from 'lucide-react';

type Mode = 'fixed' | 'percent' | 'crf';
interface Props { mode: Mode; onChange: (m: Mode) => void; }

const items: { key: Mode; label: string; icon: React.ReactNode }[] = [
  { key: 'fixed', label: 'Fixed Size', icon: <Ruler size={16} /> },
  { key: 'percent', label: 'Percent', icon: <Percent size={16} /> },
  { key: 'crf', label: 'Quality', icon: <Sparkles size={16} /> },
];

export default function Sidebar({ mode, onChange }: Props) {
  return (
    <aside className="flex-c justify-between flex-shrink-0 pad-20" style={{width:260, background:'#0c101d', borderRight:'1px solid rgba(15,23,42,0.5)'}}>
      <div>
        <div className="flex-r items-center gap-12 mar-b-32 drag-region">
          <div className="flex-r items-center justify-center font-bold text-white" style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6366F1,#4F46E5)'}}>E</div>
          <div>
            <div className="text-sm font-semibold" style={{color:'white'}}>EasyVR</div>
            <div style={{color:'#64748b',fontSize:10}}>Video Resizer</div>
          </div>
        </div>
        <div className="stack-4">
          {items.map(item => {
            const active = mode === item.key;
            return (
              <div key={item.key} onClick={() => onChange(item.key)}
                className="flex-r items-center gap-12 pad-x-12 pad-y-10 rounded-lg cursor-pointer text-sm"
                style={{
                  border: active ? '1px solid rgba(79,70,229,0.3)' : '1px solid transparent',
                  background: active ? 'rgba(79,70,229,0.1)' : 'transparent',
                  color: active ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
              >
                {item.icon} <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="stack-4">
        <div className="flex-r items-center gap-12 pad-x-12 pad-y-10 rounded-lg text-sm cursor-pointer" style={{color:'#94a3b8',border:'1px solid transparent',transition:'all 0.2s'}}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
          <Settings size={16} /> <span>Settings</span>
        </div>
        <div className="flex-r items-center gap-12 pad-x-12 pad-y-10 rounded-lg text-sm cursor-pointer" style={{color:'#94a3b8',border:'1px solid transparent',transition:'all 0.2s'}}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
          <Info size={16} /> <span>About</span>
        </div>
      </div>
    </aside>
  );
}
