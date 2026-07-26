import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function WindowControls() {
  return (
    <div className="no-drag flex items-center" style={{ gap: 2 }}>
      <button
        onClick={() => window.electronAPI.minimize()}
        className="win-btn"
        aria-label="Minimize"
        title="Minimize"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => window.electronAPI.maximize()}
        className="win-btn"
        aria-label="Maximize"
        title="Maximize"
      >
        <Square size={11} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => window.electronAPI.close()}
        className="win-btn win-btn-close"
        aria-label="Close"
        title="Close"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
