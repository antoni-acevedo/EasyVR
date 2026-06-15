import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function CRFInput({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>QUALITY (CRF)</label>
      <span style={{ fontSize: 10, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>18 = best quality / 28 = smallest file</span>
      <input type="range" min={18} max={28} step={1} value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Best</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>CRF {value}</span>
        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Smaller</span>
      </div>
    </div>
  );
}
