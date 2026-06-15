import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="flex-r items-center" style={{height:48,background:'rgba(7,10,20,0.7)',border:'1px solid #1e293b',borderRadius:8,overflow:'hidden',transition:'border-color 0.2s'}}>
      <input className="flex-1 bg-transparent pad-x-16 pad-y-8 text-base" style={{color:'white',outline:'none',border:'none',height:'100%'}}
        value={value} onChange={e => onChange(e.target.value)} />
      <div className="flex-r items-center gap-8 pad-x-16" style={{height:'100%',background:'rgba(13,17,31,0.7)',borderLeft:'1px solid #1e293b',color:'#94a3b8',fontSize:13,cursor:'pointer',transition:'color 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.color='white'}
        onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>
        MB <ChevronDown size={14} />
      </div>
    </div>
  );
}
