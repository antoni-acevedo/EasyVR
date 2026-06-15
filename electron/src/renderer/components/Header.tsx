import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface Props { fileName: string; }

export default function Header({ fileName }: Props) {
  return (
    <div className="flex-r items-center justify-between flex-shrink-0 drag-region pad-x-8" style={{height:40}}>
      <div className="flex-r items-center gap-8">
        {fileName && <span style={{color:'#94a3b8',fontSize:12,fontWeight:300}}>{fileName}</span>}
      </div>
      <div className="flex-r items-center no-drag" style={{gap:4}}>
        <button onClick={()=>window.electronAPI.minimize()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#64748b',transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='#e2e8f0'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#64748b'}}>
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <button onClick={()=>window.electronAPI.maximize()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#475569',transition:'all 0.15s',opacity:0.4}}
          title="Maximize disabled for transparent window">
          <Square size={12} strokeWidth={2.5} />
        </button>
        <button onClick={()=>window.electronAPI.close()} className="flex-r items-center justify-center" style={{width:36,height:28,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',color:'#64748b',transition:'all 0.15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.25)';e.currentTarget.style.color='#f87171'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#64748b'}}>
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
