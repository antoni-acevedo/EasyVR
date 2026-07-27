import React, { useEffect } from 'react';
import logoIcon from '../logo-icon.png';

interface Props {
  visible: boolean;
  onDone: () => void;
}

export default function SplashScreen({ visible, onDone }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg-app)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.35s ease',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          padding: 16,
          animation: 'splashPulse 1.4s ease-in-out infinite',
        }}
      >
        <img
          src={logoIcon}
          alt="EasyVR"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          EasyVR
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Video Resizer
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        v2.0.0
      </div>
      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
