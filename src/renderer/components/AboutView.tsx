import React from 'react';
import { Info, Code, Heart, ShieldCheck, ExternalLink } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <div className="surface" style={{ padding: 24 }}>
        <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700,
            }}
          >
            <Info size={26} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>EasyVR</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Video Resizer · version 2.0.0</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Compress videos from the Windows right-click menu. Choose a fixed target size,
          a percentage, or a quality level (CRF). EasyVR wraps FFmpeg with a clean modern UI
          and supports batch processing so you can resize several files in one go.
        </p>
      </div>

      <div className="surface" style={{ padding: 18 }}>
        <Item icon={<Code size={16} />} title="Source code" desc="github.com/antoni-acevedo/EasyVR" />
        <Item icon={<ExternalLink size={16} />} title="Repository" desc="Open on GitHub to fork, report issues or contribute" />
        <Item icon={<Heart size={16} />} title="Built with" desc="Electron, React, TypeScript, Tailwind, FFmpeg" />
        <Item icon={<ShieldCheck size={16} />} title="License" desc="MIT — free for personal and commercial use" />
      </div>
    </div>
  );
}

function Item({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--bg-soft)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </div>
  );
}
