import React from 'react';
import { Settings as SettingsIcon, Cpu, Globe2, FolderCog } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <Section icon={<Cpu size={16} />} title="FFmpeg engine" desc="Encoder used to process your videos.">
        <Row k="Status" v="Detected in local folder" />
        <Row k="Codec support" v="H.264 (libx264), H.265 (libx265)" />
        <Row k="Path" v="Resolved at startup from local /ffmpeg folder" />
      </Section>

      <Section icon={<FolderCog size={16} />} title="Output" desc="Default options for processed files.">
        <Row k="Default format" v="MP4" />
        <Row k="Default location" v="Same folder as the source video" />
      </Section>

      <Section icon={<Globe2 size={16} />} title="Application" desc="General preferences.">
        <Row k="Language" v="English (system default)" />
        <Row k="Version" v="2.0.0" />
      </Section>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: 'var(--accent-soft)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <SettingsIcon size={14} style={{ color: 'var(--accent)', marginTop: 2 }} />
        <div>
          Settings here are read-only placeholders for the new visual layer.
          Persistent configuration will arrive in a future update.
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="surface" style={{ padding: 18 }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
        </div>
      </div>
      <div className="flex flex-col" style={{ gap: 10 }}>{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between" style={{ paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k}</span>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
    </div>
  );
}
