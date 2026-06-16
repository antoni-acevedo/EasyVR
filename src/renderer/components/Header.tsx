import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface Props { fileName: string; fileCount?: number; batchCurrent?: string; }

export default function Header({ fileName, fileCount, batchCurrent }: Props) {
  const title = batchCurrent
    ? batchCurrent
    : fileCount && fileCount > 1
      ? `${fileCount} files selected`
      : fileName;
  return (
    <div className="flex-r items-center justify-between flex-shrink-0 drag-region pad-x-8" style={{height:40}}>
      <div className="flex-r items-center gap-8">
        {title && <span style={{color:'#FFFFFF',fontSize:12,fontWeight:300}}>{title}</span>}
      </div>
      <div className="flex-r items-center no-drag" style={{gap:4}}>
        <button onClick={()=>window.electronAPI.minimize()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#FFFFFF',transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='white'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FFFFFF'}}>
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <button onClick={()=>window.electronAPI.maximize()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#FFFFFF',transition:'all 0.15s',opacity:0.4}}
          title="Maximize disabled for transparent window">
          <Square size={12} strokeWidth={2.5} />
        </button>
        <button onClick={()=>window.electronAPI.close()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#FFFFFF',transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.color='#f87171'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FFFFFF'}}>
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
