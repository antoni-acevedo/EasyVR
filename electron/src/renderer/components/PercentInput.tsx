import React from 'react';
interface Props { value: number; onChange: (v: number) => void; }
export default function PercentInput({ value, onChange }: Props) {
  return (
    <div>
      <input type="range" min={10} max={90} step={5} value={value} onChange={e=>onChange(parseInt(e.target.value))} style={{width:'100%'}} />
      <div className="flex-r justify-between mar-t-4">
        <span style={{fontSize:11,color:'#8A96A8'}}>10%</span>
        <span style={{fontSize:13,fontWeight:600,color:'#4CC2F1'}}>{value}%</span>
        <span style={{fontSize:11,color:'#8A96A8'}}>90%</span>
      </div>
    </div>
  );
}
