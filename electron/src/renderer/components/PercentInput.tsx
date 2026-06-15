import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function PercentInput({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>COMPRESSION RATIO</label>
      <input type="range" min={10} max={90} step={5} value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>10%</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{value}%</span>
        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>90%</span>
      </div>
    </div>
  );
}
