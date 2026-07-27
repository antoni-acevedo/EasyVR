import React from 'react';
import ThemeToggle from './ThemeToggle';
import WindowControls from './WindowControls';

interface Props {
  title: string;
  description: string;
}

export default function TopBar({ title, description }: Props) {
  return (
    <div
      className="drag-region flex items-start justify-between flex-shrink-0"
      style={{
        padding: '20px 28px 12px 28px',
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          marginTop: 6,
          lineHeight: 1.4,
        }}>
          {description}
        </p>
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <ThemeToggle />
        <WindowControls />
      </div>
    </div>
  );
}
