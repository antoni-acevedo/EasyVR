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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between py-3 cursor-pointer select-none flex-shrink-0" onClick={onToggle}>
        <span className="text-[10px] tracking-widest text-slate-500 uppercase">DevConsole ({entries.length} lines)</span>
        <ChevronDown size={14} className={`text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2 mb-2 flex-shrink-0">
            <button onClick={onClear} className="bg-slate-800 hover:bg-slate-700 text-slate-400 border-none rounded px-3 py-1 text-[10px] cursor-pointer transition-colors">Clear</button>
            <button onClick={onCopy} className="bg-slate-800 hover:bg-slate-700 text-slate-400 border-none rounded px-3 py-1 text-[10px] cursor-pointer transition-colors">Copy All</button>
          </div>
          <div ref={ref} className="flex-1 min-h-[150px] bg-[#05070d] border border-slate-900 rounded-lg p-4 font-mono text-xs text-slate-500 overflow-y-auto">
            {entries.length === 0 && (
              <div className="text-slate-700 italic">No output yet</div>
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
