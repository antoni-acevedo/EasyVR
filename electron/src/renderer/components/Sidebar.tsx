import React from 'react';
import { Frame, Percent, Sparkles, Settings, Info } from 'lucide-react';
import logoIcon from '../logo-icon.png';

type Mode = 'fixed' | 'percent' | 'crf';
interface Props { mode: Mode; onChange: (m: Mode) => void; }

const items: { key: Mode; label: string; icon: React.ReactNode }[] = [
  { key: 'fixed',   label: 'Fixed Size', icon: <Frame size={16} /> },
  { key: 'percent', label: 'Percent',    icon: <Percent size={16} /> },
  { key: 'crf',     label: 'Quality',    icon: <Sparkles size={16} /> },
];

export default function Sidebar({ mode, onChange }: Props) {
  const sidebarW = 170;
  return (
    <aside className="flex-c justify-between flex-shrink-0 pad-20" style={{width:sidebarW,background:'transparent'}}>
      <div>
        <div className="flex-r items-center gap-12 mar-b-32 drag-region">
          <img src={logoIcon} alt="EasyVR" style={{width:36, height:36, borderRadius:10}} />
          <div>
            <div className="text-sm font-semibold" style={{color:'white'}}>EasyVR</div>
            <div style={{color:'#FFFFFF', fontSize:10}}>Video Resizer</div>
          </div>
        </div>
        <div className="stack-4">
          {items.map(item => {
            const active = mode === item.key;
            return (
              <div key={item.key} onClick={() => onChange(item.key)}
                className="flex-r items-center gap-12 pad-x-12 pad-y-10 cursor-pointer text-sm"
                style={{
                  borderRadius: 10,
                  border: active ? '2px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: active ? '#4CC2F1' : '#FFFFFF',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; } }}
              >
                {item.icon} <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="stack-4">
        <div className="flex-r items-center gap-12 pad-x-12 pad-y-10 rounded-lg text-sm cursor-pointer" style={{color:'#FFFFFF', border:'1px solid transparent', transition:'all 0.2s'}}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}>
          <Settings size={16} /> <span>Settings</span>
        </div>
        <div className="flex-r items-center gap-12 pad-x-12 pad-y-10 rounded-lg text-sm cursor-pointer" style={{color:'#FFFFFF', border:'1px solid transparent', transition:'all 0.2s'}}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}>
          <Info size={16} /> <span>About</span>
        </div>
      </div>
    </aside>
  );
}
