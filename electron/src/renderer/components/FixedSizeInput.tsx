import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function FixedSizeInput({ value, onChange }: Props) {
  return (
    <div className="flex-r items-center" style={{height:48,background:'#05070D',border:'1px solid rgba(30,41,59,0.6)',borderRadius:8,overflow:'hidden',transition:'border-color 0.2s'}}>
      <input className="flex-1 bg-transparent pad-x-16 pad-y-8 text-base" style={{color:'white',outline:'none',border:'none',height:'100%'}}
        value={value} onChange={e => onChange(e.target.value)} />
      <div className="flex-r items-center gap-8 pad-x-16" style={{height:'100%',background:'#05070D',borderLeft:'1px solid rgba(30,41,59,0.6)',color:'#FFFFFF',fontSize:13,cursor:'pointer',transition:'color 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.color='#FFFFFF'}
        onMouseLeave={e=>e.currentTarget.style.color='#FFFFFF'}>
        MB <ChevronDown size={14} />
      </div>
    </div>
  );
}
