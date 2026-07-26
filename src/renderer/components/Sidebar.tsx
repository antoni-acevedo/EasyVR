import React from 'react';
import { Frame, Percent, Sparkles, Settings, Info } from 'lucide-react';
import DonationCard from './ProCard';

export type View = 'fixed' | 'percent' | 'quality' | 'settings' | 'about';

interface Props {
  view: View;
  onChange: (v: View) => void;
}

const APP_VERSION = '2.0.0';

const items: { key: View; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'fixed',   label: 'Fixed Size', desc: 'Resize to a set resolution',  icon: <Frame size={18} /> },
  { key: 'percent', label: 'Percent',    desc: 'Resize by percentage',         icon: <Percent size={18} /> },
  { key: 'quality', label: 'Quality',    desc: 'Adjust video quality',         icon: <Sparkles size={18} /> },
];

const bottomItems: { key: View; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'settings', label: 'Settings', desc: 'App preferences', icon: <Settings size={18} /> },
  { key: 'about',    label: 'About',    desc: 'Learn more',      icon: <Info size={18} /> },
];

function NavItem({
  active, onClick, icon, label, desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 text-left w-full no-drag"
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: active ? 'var(--accent-soft)' : 'transparent',
        border: '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--bg-soft)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: active ? 'var(--accent)' : 'var(--bg-icon)',
          color: active ? '#FFFFFF' : 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: active ? 'none' : '1px solid var(--border-color)',
          transition: 'all 0.15s ease',
        }}
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingTop: 2 }}>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.01em',
          color: active ? 'var(--accent)' : 'var(--text-primary)',
        }}>
          {label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.3 }}>{desc}</span>
      </div>
    </button>
  );
}

export default function Sidebar({ view, onChange }: Props) {
  return (
    <aside
      className="drag-region flex flex-col justify-between flex-shrink-0"
      style={{
        width: 240,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        padding: '14px 14px 14px 14px',
      }}
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-1">
          {items.map((it) => (
            <NavItem
              key={it.key}
              active={view === it.key}
              onClick={() => onChange(it.key)}
              icon={it.icon}
              label={it.label}
              desc={it.desc}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {bottomItems.map((it) => (
            <NavItem
              key={it.key}
              active={view === it.key}
              onClick={() => onChange(it.key)}
              icon={it.icon}
              label={it.label}
              desc={it.desc}
            />
          ))}
        </div>
        <DonationCard />
        <div
          style={{
            textAlign: 'center',
            padding: '6px 0 2px 0',
            fontSize: 10,
            fontWeight: 500,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          EasyVR <span style={{ opacity: 0.6 }}>· v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
