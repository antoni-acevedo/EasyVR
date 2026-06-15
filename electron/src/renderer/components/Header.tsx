import React from 'react';

interface Props {
  fileName: string;
  fileSize: number;
}

export default function Header({ fileName, fileSize }: Props) {
  return (
    <div className="drag-region flex items-center justify-between px-4 py-2.5" style={{ background: 'white' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center no-drag" style={{ background: 'var(--accent)' }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>E</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.15 }}>EasyVR</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1 }}>Video Resizer</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {fileName && (
          <span style={{ fontSize: 11, color: 'var(--text-light)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </span>
        )}
        <div className="flex gap-1 no-drag">
          <button onClick={() => window.electronAPI.minimize()} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>─</button>
          <button onClick={() => window.electronAPI.maximize()} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>□</button>
          <button onClick={() => window.electronAPI.close()} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>✕</button>
        </div>
      </div>
    </div>
  );
}
