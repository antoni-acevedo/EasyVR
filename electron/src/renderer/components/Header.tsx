import React from 'react';

interface Props {
  fileName: string;
  fileSize: number;
}

export default function Header({ fileName, fileSize }: Props) {
  return (
    <div className="drag-region flex items-center justify-between px-6 py-3 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center no-drag" style={{ background: 'var(--accent)' }}>
          <span className="text-white font-bold text-lg">E</span>
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight" style={{ color: 'var(--text)' }}>EasyVR</div>
          <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Video Resizer</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {fileName && (
          <span className="text-[11px] max-w-[180px] truncate" style={{ color: 'var(--text-light)' }}>
            {fileName}
          </span>
        )}
        <div className="flex gap-1 no-drag">
          <button onClick={() => window.electronAPI.minimize()} className="w-7 h-7 border-none bg-transparent rounded cursor-pointer text-sm flex items-center justify-center" style={{ color: '#666' }}>─</button>
          <button onClick={() => window.electronAPI.maximize()} className="w-7 h-7 border-none bg-transparent rounded cursor-pointer text-xs flex items-center justify-center" style={{ color: '#666' }}>□</button>
          <button onClick={() => window.electronAPI.close()} className="w-7 h-7 border-none bg-transparent rounded cursor-pointer text-sm flex items-center justify-center" style={{ color: '#666' }}>✕</button>
        </div>
      </div>
    </div>
  );
}
