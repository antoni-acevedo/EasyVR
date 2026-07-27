import React from 'react';
import { Heart } from 'lucide-react';

export default function DonationCard() {
  const handleClick = () => {
    const url = 'https://github.com/sponsors/antoni-acevedo';
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="no-drag flex items-center gap-3 w-full text-left"
      style={{
        padding: 14,
        borderRadius: 14,
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#FCA5A5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#FEE2E2',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Heart size={18} strokeWidth={2} fill="#EF4444" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>Support EasyVR</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          Buy us a coffee
        </div>
      </div>
    </button>
  );
}
