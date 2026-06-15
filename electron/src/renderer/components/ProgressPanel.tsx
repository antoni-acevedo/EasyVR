import React, { RefObject } from 'react';

interface Props {
  progress: number;
  statusText: string;
  logs: string[];
  logsRef: RefObject<HTMLDivElement | null>;
  result: { success: boolean; origMb: string; newMb: string; saved: string; outputName: string } | null;
  onCloseResult: () => void;
}

export default function ProgressPanel({ progress, statusText, logs, logsRef, result, onCloseResult }: Props) {
  return (
    <div style={{ marginTop: 14 }}>
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Status text */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{statusText}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{progress}%</span>
      </div>

      {/* Console log */}
      {logs.length > 0 && (
        <div ref={logsRef} className="console-box" style={{ marginTop: 8 }}>
          {logs.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* Result dialog */}
      {result && (
        <div style={{
          background: result.success ? '#E8F5E9' : '#FFEBEE',
          borderRadius: 8, padding: 12, marginTop: 10,
        }}>
          {result.success ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2E7D32', marginBottom: 4 }}>✓ Video compressed successfully</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                <div>Original: {result.origMb} MB</div>
                <div>Compressed: {result.newMb} MB</div>
                <div>Saved: {result.saved} MB</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{result.outputName}</div>
              </div>
              <button onClick={onCloseResult} style={{
                marginTop: 8, background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12,
                cursor: 'pointer', fontWeight: 600,
              }}>OK</button>
            </div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#C62828' }}>✕ Compression failed</div>
          )}
        </div>
      )}
    </div>
  );
}
