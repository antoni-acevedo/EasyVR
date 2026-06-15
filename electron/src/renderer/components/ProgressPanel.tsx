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
    <div className="mt-4">
      {/* Progress bar */}
      <div className="h-[6px] rounded overflow-hidden bg-[#E8E8E8]">
        <div className="h-full rounded transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
      </div>

      {/* Status text */}
      <div className="flex justify-between mt-[6px]">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{statusText}</span>
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{progress}%</span>
      </div>

      {/* Console log */}
      {logs.length > 0 && (
        <div ref={logsRef} className="console-box mt-2">
          {logs.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* Result dialog */}
      {result && (
        <div className={`rounded-lg p-3 mt-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          {result.success ? (
            <div>
              <div className="text-sm font-semibold text-green-700 mb-1">✓ Video compressed successfully</div>
              <div className="text-xs text-[#555]">
                <div>Original: {result.origMb} MB</div>
                <div>Compressed: {result.newMb} MB</div>
                <div>Saved: {result.saved} MB</div>
                <div className="text-[11px] mt-[2px]" style={{ color: 'var(--text-light)' }}>{result.outputName}</div>
              </div>
              <button onClick={onCloseResult} className="mt-2 bg-[var(--accent)] text-white border-none rounded px-4 py-1 text-xs font-semibold cursor-pointer">OK</button>
            </div>
          ) : (
            <div className="text-sm font-semibold text-red-700">✕ Compression failed</div>
          )}
        </div>
      )}
    </div>
  );
}
