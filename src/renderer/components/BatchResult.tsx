import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface BatchFileEntry {
  fileName: string;
  success: boolean;
  originalSize: number;
  finalSize: number;
  outputPath: string;
}

interface Props {
  results: BatchFileEntry[];
  onClose: () => void;
}

function mb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function BatchResult({ results, onClose }: Props) {
  const successCount = results.filter((r) => r.success).length;
  const totalOrig = results.reduce((s, r) => s + r.originalSize, 0);
  const totalFinal = results.reduce((s, r) => s + r.finalSize, 0);

  return (
    <div className="surface" style={{ padding: 18, marginTop: 14 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          Processed {results.length} file{results.length === 1 ? '' : 's'} — {successCount} successful
        </span>
      </div>

      <div
        style={{
          background: 'var(--bg-soft)',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--border-soft)',
        }}
      >
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 1fr 24px',
            gap: 12,
            padding: '10px 14px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Original</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Final</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved</span>
          <span></span>
        </div>
        {results.map((r, i) => {
          const saved = r.success ? ((r.originalSize - r.finalSize) / (1024 * 1024)).toFixed(1) : '—';
          const name = r.fileName.length > 32 ? r.fileName.slice(0, 29) + '…' : r.fileName;
          return (
            <div
              key={i}
              className="grid items-center"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 24px',
                gap: 12,
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-soft)',
                fontSize: 12,
                color: 'var(--text-primary)',
                opacity: r.success ? 1 : 0.6,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              <span>{mb(r.originalSize)} MB</span>
              <span>{r.success ? `${mb(r.finalSize)} MB` : '—'}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.success ? `${saved} MB` : '—'}</span>
              <span>
                {r.success
                  ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                  : <XCircle size={14} style={{ color: 'var(--error)' }} />}
              </span>
            </div>
          );
        })}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 1fr 24px',
            gap: 12,
            padding: '12px 14px',
            background: 'var(--accent-soft)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          <span>Total</span>
          <span>{mb(totalOrig)} MB</span>
          <span>{mb(totalFinal)} MB</span>
          <span style={{ color: 'var(--accent)' }}>{mb(totalOrig - totalFinal)} MB</span>
          <span></span>
        </div>
      </div>

      <button className="btn-ghost" onClick={onClose} style={{ marginTop: 14 }}>
        Close
      </button>
    </div>
  );
}
