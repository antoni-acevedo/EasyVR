import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="flex-r items-center" style={{height:40,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:8,overflow:'hidden',transition:'border-color 0.2s'}}>
      <input className="flex-1 bg-transparent pad-x-16 pad-y-6 text-base" style={{color:'white',outline:'none',border:'none',height:'100%'}}
        value={value} onChange={e => onChange(e.target.value)} />
      <div className="flex-r items-center gap-8 pad-x-16" style={{height:'100%',background:'rgba(99,102,241,0.06)',borderLeft:'1px solid rgba(99,102,241,0.2)',color:'#FFFFFF',fontSize:13,cursor:'pointer',transition:'color 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.12)'}
        onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.06)'}>
        MB <ChevronDown size={14} />
      </div>
    </div>
  );
}
