import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface RawEntry { type: 'cmd'|'stdout'|'stderr'; line: string; }
interface Props { open: boolean; onToggle: () => void; entries: RawEntry[]; onClear: () => void; onCopy: () => void; }

export default function DevConsole({ open, onToggle, entries, onClear, onCopy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { if (ref.current) requestAnimationFrame(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }); }, [entries]);

  const lineColor = (type: string, line: string) => type==='cmd'?'#60A5FA':type==='stdout'?'#8A96A8':type==='stderr'&&/error/i.test(line)?'#F87171':type==='stderr'?'#FBBF24':'#8A96A8';
  const prefixMap: Record<string,string> = {cmd:'$',stdout:'>',stderr:'!'};

  return (
    <div>
      <div className="flex-r items-center justify-between pad-y-12 cursor-pointer" onClick={onToggle}>
        <span style={{color:'#FFFFFF',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>DEVCONSOLE ({entries.length} lines)</span>
        <ChevronDown size={14} style={{color:'#FFFFFF',transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0)'}} />
      </div>

      {open && (
        <div>
          <div className="flex-r gap-8 mar-b-8">
            <button onClick={onClear} style={{background:'rgba(255,255,255,0.06)',color:'#8A96A8',border:'none',borderRadius:4,padding:'4px 12px',fontSize:10,cursor:'pointer'}}>Clear</button>
            <button onClick={onCopy} style={{background:'rgba(255,255,255,0.06)',color:'#8A96A8',border:'none',borderRadius:4,padding:'4px 12px',fontSize:10,cursor:'pointer'}}>Copy All</button>
          </div>
          <div ref={ref} className="w-full font-mono text-xs overflow-y-auto pad-12 mar-t-12" style={{
            height: 140,
            background: '#13161C',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            color: '#8A96A8',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {entries.length === 0 && <div style={{color:'#FFFFFF',fontStyle:'italic'}}>No output yet</div>}
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
