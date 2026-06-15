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
    <div className="mb-4 flex-shrink-0">
      <div className="h-1 rounded-full overflow-hidden bg-slate-800">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: '#4F46E5' }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-400">{statusText}</span>
        <span className="text-xs font-semibold text-indigo-400">{progress}%</span>
      </div>

      {result && (
        <div className={`rounded-lg p-3 mt-3 border ${result.success ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-red-900/20 border-red-800/30'}`}>
          {result.success ? (
            <div>
              <div className="text-sm font-semibold text-emerald-400 mb-1">✓ Video compressed</div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>Original: {result.origMb} MB</div>
                <div>Compressed: {result.newMb} MB</div>
                <div>Saved: {result.saved} MB</div>
                <div className="text-slate-500 mt-1">{result.outputName}</div>
              </div>
              <button onClick={onCloseResult} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-lg px-4 py-1.5 text-xs font-semibold cursor-pointer transition-colors">OK</button>
            </div>
          ) : (
            <div className="text-sm font-semibold text-red-400">✕ Compression failed</div>
          )}
        </div>
      )}
    </div>
  );
}
