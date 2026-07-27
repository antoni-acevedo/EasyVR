import React from 'react';

const FORMATS = ['MP4', 'AVI', 'MOV', 'MKV', 'WMV'];

export default function FormatChips() {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2" style={{ marginTop: 24 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
        Supported formats:
      </span>
      {FORMATS.map((f) => (
        <span key={f} className="chip">{f}</span>
      ))}
      <span className="chip chip-muted">and more...</span>
    </div>
  );
}
