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
      <div style={{height:4,borderRadius:2,overflow:'hidden',background:'rgba(255,255,255,0.06)'}}>
        <div style={{width:`${progress}%`,height:'100%',borderRadius:2,background:'#4CC2F1',transition:'width 0.3s'}} />
      </div>
      <div className="flex-r justify-between mar-t-8">
        <span style={{color:'#8A96A8',fontSize:11}}>{statusText}</span>
        <span style={{color:'#4CC2F1',fontSize:11,fontWeight:600}}>{progress}%</span>
      </div>
      {result && (
        <div className={`pad-12 mar-t-12`} style={{borderRadius:8,border:'1px solid rgba(76,194,241,0.25)',background:'rgba(76,194,241,0.08)'}}>
          {result.success ? (
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#4CC2F1',marginBottom:4}}>✓ Video compressed</div>
              <div style={{fontSize:11,color:'#8A96A8'}}>
                <div>Original: {result.origMb} MB</div>
                <div>Compressed: {result.newMb} MB</div>
                <div>Saved: {result.saved} MB</div>
                <div style={{color:'#717D8E',marginTop:4}}>{result.outputName}</div>
              </div>
              <button onClick={onCloseResult} style={{marginTop:12,background:'#4CC2F1',color:'#13161C',border:'none',borderRadius:8,padding:'6px 16px',fontSize:11,fontWeight:600,cursor:'pointer',transition:'background 0.2s'}}>OK</button>
            </div>
          ) : (
            <div style={{fontSize:13,fontWeight:600,color:'#f87171'}}>✕ Compression failed</div>
          )}
        </div>
      )}
    </div>
  );
}
