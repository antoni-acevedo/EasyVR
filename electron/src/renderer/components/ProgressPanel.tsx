import React, { RefObject } from 'react';

interface Props {
  progress: number; statusText: string; logs: string[];
  logsRef: RefObject<HTMLDivElement | null>;
  result: { success: boolean; origMb: string; newMb: string; saved: string; outputName: string } | null;
  onCloseResult: () => void;
}

export default function ProgressPanel({ progress, statusText, logs, logsRef, result, onCloseResult }: Props) {
  return (
    <div className="mar-b-16 flex-shrink-0">
      <div style={{height:4,borderRadius:2,overflow:'hidden',background:'#1e293b'}}>
        <div style={{width:`${progress}%`,height:'100%',borderRadius:2,background:'#4F46E5',transition:'width 0.3s'}} />
      </div>
      <div className="flex-r justify-between mar-t-8">
        <span style={{color:'#FFFFFF',fontSize:11}}>{statusText}</span>
        <span style={{color:'#FFFFFF',fontSize:11,fontWeight:600}}>{progress}%</span>
      </div>
      {result && (
        <div className="pad-12 mar-t-12" style={{borderRadius:8,border:`1px solid ${result.success?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'}`,background:result.success?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)'}}>
          {result.success ? (
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#34d399',marginBottom:4}}>✓ Video compressed</div>
              <div style={{fontSize:11,color:'#FFFFFF'}}>
                <div>Original: {result.origMb} MB</div>
                <div>Compressed: {result.newMb} MB</div>
                <div>Saved: {result.saved} MB</div>
                <div style={{color:'#FFFFFF',marginTop:4}}>{result.outputName}</div>
              </div>
              <button onClick={onCloseResult} style={{marginTop:12,background:'#4f46e5',color:'white',border:'none',borderRadius:8,padding:'6px 16px',fontSize:11,fontWeight:600,cursor:'pointer',transition:'background 0.2s'}}>OK</button>
            </div>
          ) : (
            <div style={{fontSize:13,fontWeight:600,color:'#f87171'}}>✕ Compression failed</div>
          )}
        </div>
      )}
    </div>
  );
}
