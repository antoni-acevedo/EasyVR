import React, { RefObject } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultData {
  success: boolean;
  origMb: string;
  newMb: string;
  saved: string;
  outputName: string;
}

interface Props {
  progress: number;
  statusText: string;
  result: ResultData | null;
  onCloseResult: () => void;
}

export default function ProgressPanel({ progress, statusText, result, onCloseResult }: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'var(--border-soft)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 3,
            background: 'var(--accent)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {statusText}
        </span>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
          {progress}%
        </span>
      </div>
      {result && (
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 14,
            border: `1px solid ${result.success ? 'var(--success-soft)' : 'var(--error-soft)'}`,
            background: result.success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          }}
        >
          {result.success ? (
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', color: 'var(--success)' }}>
                  Video compressed
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div className="flex items-center justify-between"><span>Original:</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{result.origMb} MB</span></div>
                <div className="flex items-center justify-between"><span>Compressed:</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{result.newMb} MB</span></div>
                <div className="flex items-center justify-between"><span>Saved:</span><span style={{ color: 'var(--success)', fontWeight: 700 }}>{result.saved} MB</span></div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 11 }}>{result.outputName}</div>
              </div>
              <button
                onClick={onCloseResult}
                style={{
                  marginTop: 12,
                  background: 'var(--accent)',
                  color: 'var(--text-on-accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle size={16} style={{ color: 'var(--error)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--error)' }}>
                Compression failed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
