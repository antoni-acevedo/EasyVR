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

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function BatchResult({ results, onClose }: Props) {
  const successCount = results.filter(r => r.success).length;
  const totalOrig = results.reduce((s, r) => s + r.originalSize, 0);
  const totalFinal = results.reduce((s, r) => s + r.finalSize, 0);

  return (
    <div className="batch-result">
      <div className="batch-result-header">
        <CheckCircle2 size={16} strokeWidth={2} style={{ color: '#4CC2F1' }} />
        <span>Processed {results.length} file(s) — {successCount} successful</span>
      </div>

      <div className="batch-result-table">
        <div className="batch-result-row batch-result-row-header">
          <span>File</span>
          <span>Original</span>
          <span>Final</span>
          <span>Saved</span>
          <span></span>
        </div>
        {results.map((r, i) => {
          const saved = r.success ? ((r.originalSize - r.finalSize) / (1024 * 1024)).toFixed(1) : '-';
          return (
            <div key={i} className="batch-result-row" style={{ opacity: r.success ? 1 : 0.6 }}>
              <span className="batch-result-file">{r.fileName.length > 25 ? r.fileName.slice(0, 22) + '...' : r.fileName}</span>
              <span>{formatMb(r.originalSize)} MB</span>
              <span>{r.success ? formatMb(r.finalSize) + ' MB' : '-'}</span>
              <span style={{ color: '#4CC2F1' }}>{r.success ? `${saved} MB` : '-'}</span>
              <span>{r.success
                ? <CheckCircle2 size={14} strokeWidth={2} style={{ color: '#22c55e' }} />
                : <XCircle size={14} strokeWidth={2} style={{ color: '#ef4444' }} />}
              </span>
            </div>
          );
        })}
        <div className="batch-result-row batch-result-row-total">
          <span>Total</span>
          <span>{formatMb(totalOrig)} MB</span>
          <span>{formatMb(totalFinal)} MB</span>
          <span style={{ color: '#4CC2F1' }}>{formatMb(totalOrig - totalFinal)} MB</span>
          <span></span>
        </div>
      </div>

      <button className="batch-result-close" onClick={onClose}>OK</button>
    </div>
  );
}
