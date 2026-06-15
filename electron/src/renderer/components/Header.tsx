import React from 'react';
import { Minimize2, Square, X } from 'lucide-react';

interface Props {
  fileName: string;
}

export default function Header({ fileName }: Props) {
  return (
    <div className="h-12 flex items-center justify-between mb-4 flex-shrink-0 drag-region">
      <div className="flex items-center gap-2">
        {fileName && (
          <span className="text-slate-400 text-sm font-light">{fileName}</span>
        )}
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button onClick={() => window.electronAPI.minimize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <Minimize2 size={14} />
        </button>
        <button onClick={() => window.electronAPI.maximize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <Square size={12} />
        </button>
        <button onClick={() => window.electronAPI.close()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
