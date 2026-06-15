import React from 'react';
interface Props { value: number; onChange: (v: number) => void; }
export default function CRFInput({ value, onChange }: Props) {
  return (
    <div>
      <div style={{fontSize:11,color:'#64748b',marginBottom:8}}>18 = best / 28 = smallest</div>
      <input type="range" min={18} max={28} step={1} value={value} onChange={e=>onChange(parseInt(e.target.value))} style={{width:'100%'}} />
      <div className="flex-r justify-between mar-t-4">
        <span style={{fontSize:11,color:'#64748b'}}>Best</span>
        <span style={{fontSize:13,fontWeight:600,color:'#818cf8'}}>CRF {value}</span>
        <span style={{fontSize:11,color:'#64748b'}}>Smaller</span>
      </div>
    </div>
  );
}
