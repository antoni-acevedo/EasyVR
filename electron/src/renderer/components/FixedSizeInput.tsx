import React from 'react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>TARGET SIZE</label>
      <div style={{ display: 'flex' }}>
        <input
          className="input-box"
          style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div style={{ background: '#F4F4F4', borderRadius: '0 5px 5px 0', height: 36, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -1, fontSize: 13, color: 'var(--text-secondary)' }}>
          MB
        </div>
      </div>
    </div>
  );
}
