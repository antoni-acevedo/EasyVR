import React, { useRef, useEffect } from 'react';

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

const btnStyle = "bg-gray-700 text-gray-300 border-none rounded px-[10px] py-[2px] text-[10px] cursor-pointer hover:bg-gray-600";

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
    if (type === 'cmd') return '#4FC3F7';
    if (type === 'stdout') return '#AAA';
    if (type === 'stderr' && /error/i.test(line)) return '#EF5350';
    if (type === 'stderr') return '#FFB74D';
    return '#AAA';
  };

  const prefixMap: Record<string, string> = { cmd: '$', stdout: '>', stderr: '!' };

  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="bg-none border-none cursor-pointer text-[11px] font-semibold flex items-center gap-1 p-0"
        style={{ color: 'var(--text-secondary)' }}
      >
        {open ? '▼' : '▶'} DEVCONSOLE ({entries.length} lines)
      </button>

      {open && (
        <div className="mt-[6px]">
          <div className="flex gap-1 mb-[4px]">
            <button onClick={onClear} className={btnStyle}>Clear</button>
            <button onClick={onCopy} className={btnStyle}>Copy All</button>
          </div>
          <div ref={ref} className="console-box" style={{ maxHeight: 200 }}>
            {entries.length === 0 && (
              <div className="text-[#666] italic">No output yet</div>
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
