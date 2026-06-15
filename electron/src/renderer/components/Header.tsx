import React from 'react';
import { Minimize2, Square, X } from 'lucide-react';

interface Props { fileName: string; }

export default function Header({ fileName }: Props) {
  return (
    <div className="flex-r items-center justify-between flex-shrink-0 drag-region" style={{height:48}}>
      <div className="flex-r items-center gap-8">
        {fileName && <span style={{color:'#94a3b8',fontSize:13}}>{fileName}</span>}
      </div>
      <div className="flex-r items-center gap-4 no-drag">
        <button onClick={()=>window.electronAPI.minimize()} className="flex-r items-center justify-center" style={{width:32,height:32,borderRadius:4,border:'none',background:'transparent',cursor:'pointer',color:'#94a3b8',transition:'all 0.2s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='white'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}>
          <Minimize2 size={14} />
        </button>
        <button onClick={()=>window.electronAPI.maximize()} className="flex-r items-center justify-center" style={{width:32,height:32,borderRadius:4,border:'none',background:'transparent',cursor:'pointer',color:'#94a3b8',transition:'all 0.2s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='white'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}>
          <Square size={12} />
        </button>
        <button onClick={()=>window.electronAPI.close()} className="flex-r items-center justify-center" style={{width:32,height:32,borderRadius:4,border:'none',background:'transparent',cursor:'pointer',color:'#94a3b8',transition:'all 0.2s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';e.currentTarget.style.color='#f87171'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
