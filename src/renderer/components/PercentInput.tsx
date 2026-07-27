import React from 'react';

interface Props { value: number; onChange: (v: number) => void; }

export default function PercentInput({ value, onChange }: Props) {
  return (
    <div>
      <input
        type="range"
        min={10}
        max={90}
        step={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%' }}
      />
      <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>10%</span>
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
        }}>
          {value}%
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>90%</span>
      </div>
    </div>
  );
}
