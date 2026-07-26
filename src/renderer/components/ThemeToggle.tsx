import React from 'react';
import { Sun } from 'lucide-react';

export default function ThemeToggle() {
  return (
    <button
      onClick={(e) => e.preventDefault()}
      title="Theme toggle (coming soon)"
      className="no-drag flex items-center justify-center"
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <Sun size={16} />
    </button>
  );
}
