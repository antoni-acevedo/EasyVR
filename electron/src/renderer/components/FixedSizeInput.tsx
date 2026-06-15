import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="flex-r items-center" style={{height:40,background:'rgba(19,22,28,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,overflow:'hidden',transition:'border-color 0.2s'}}>
      <input className="flex-1 bg-transparent pad-x-16 pad-y-6 text-base" style={{color:'white',outline:'none',border:'none',height:'100%'}}
        value={value} onChange={e => onChange(e.target.value)} />
      <div className="flex-r items-center gap-8 pad-x-16" style={{height:'100%',background:'rgba(19,22,28,0.4)',borderLeft:'1px solid rgba(255,255,255,0.05)',color:'#FFFFFF',fontSize:13,cursor:'pointer',transition:'color 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.color='white'}
        onMouseLeave={e=>e.currentTarget.style.color='#FFFFFF'}>
        MB <ChevronDown size={14} />
      </div>
    </div>
  );
}
