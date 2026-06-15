import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface RawEntry { type: 'cmd'|'stdout'|'stderr'; line: string; }
interface Props { open: boolean; onToggle: () => void; entries: RawEntry[]; onClear: () => void; onCopy: () => void; }

export default function DevConsole({ open, onToggle, entries, onClear, onCopy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { if (ref.current) requestAnimationFrame(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }); }, [entries]);

  const lineColor = (type: string, line: string) => type==='cmd'?'#60A5FA':type==='stdout'?'#94A3B8':type==='stderr'&&/error/i.test(line)?'#F87171':type==='stderr'?'#FBBF24':'#94A3B8';
  const prefixMap: Record<string,string> = {cmd:'$',stdout:'>',stderr:'!'};

  return (
    <div className="flex-c flex-1 min-h-0">
      <div className="flex-r items-center justify-between pad-y-12 cursor-pointer flex-shrink-0" onClick={onToggle}>
        <span style={{color:'#64748b',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>DevConsole ({entries.length} lines)</span>
        <ChevronDown size={14} style={{color:'#475569',transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0)'}} />
      </div>
      {open && (
        <div className="flex-c flex-1 min-h-0">
          <div className="flex-r gap-8 mar-b-8 flex-shrink-0">
            <button onClick={onClear} style={{background:'#1e293b',color:'#94a3b8',border:'none',borderRadius:4,padding:'4px 12px',fontSize:10,cursor:'pointer'}}>Clear</button>
            <button onClick={onCopy} style={{background:'#1e293b',color:'#94a3b8',border:'none',borderRadius:4,padding:'4px 12px',fontSize:10,cursor:'pointer'}}>Copy All</button>
          </div>
          <div ref={ref} className="flex-1 min-h-0 font-mono text-xs overflow-y-auto" style={{minHeight:150,background:'#05070d',border:'1px solid #0f1729',borderRadius:8,padding:16,color:'#64748b'}}>
            {entries.length === 0 && <div style={{color:'#334155',fontStyle:'italic'}}>No output yet</div>}
            {entries.map((e,i) => (
              <div key={i} style={{color:lineColor(e.type,e.line)}}>
                {prefixMap[e.type]||' '} {e.line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
