import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface RawEntry {
  type: 'cmd' | 'stdout' | 'stderr';
  line: string;
}

interface Props {
  open: boolean;
  onToggle: () => void;
  entries: RawEntry[];
  onClear: () => void;
  onCopy: () => void;
}

const btnStyle = "bg-slate-800 hover:bg-slate-700 text-slate-300 border-none rounded px-3 py-1 text-[10px] cursor-pointer transition-colors";

export default function DevConsole({ open, onToggle, entries, onClear, onCopy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      requestAnimationFrame(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
      });
    }
  }, [entries]);

  const lineColor = (type: string, line: string): string => {
    if (type === 'cmd') return '#60A5FA';
    if (type === 'stdout') return '#94A3B8';
    if (type === 'stderr' && /error/i.test(line)) return '#F87171';
    if (type === 'stderr') return '#FBBF24';
    return '#94A3B8';
  };

  const prefixMap: Record<string, string> = { cmd: '$', stdout: '>', stderr: '!' };

  return (
    <div>
      <div className="flex items-center justify-between py-3 cursor-pointer select-none" onClick={onToggle}>
        <span className="text-[11px] tracking-wider text-slate-400 uppercase">DevConsole ({entries.length} lines)</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div>
          <div className="flex gap-2 mb-2">
            <button onClick={onClear} className={btnStyle}>Clear</button>
            <button onClick={onCopy} className={btnStyle}>Copy All</button>
          </div>
          <div ref={ref} className="console-box" style={{ maxHeight: 200 }}>
            {entries.length === 0 && (
              <div className="text-slate-600 italic">No output yet</div>
            )}
            {entries.map((e, i) => (
              <div key={i} style={{ color: lineColor(e.type, e.line) }}>
                {prefixMap[e.type] || ' '} {e.line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
