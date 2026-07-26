import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function CRFInput({ value, onChange }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>
        18 = best quality · 28 = smallest file
      </div>
      <input
        type="range"
        min={18}
        max={28}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%' }}
      />
      <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Best</span>
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
        }}>
          CRF {value}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Smaller</span>
      </div>
    </div>
  );
}
