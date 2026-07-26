import React from 'react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <input
        className="flex-1"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '0 16px',
          height: '100%',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
          width: '100%',
          userSelect: 'text',
        }}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Target"
      />
      <div
        style={{
          padding: '0 18px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-soft)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          borderLeft: '1px solid var(--border-color)',
        }}
      >
        MB
      </div>
    </div>
  );
}
