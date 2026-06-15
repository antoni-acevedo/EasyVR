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

export default function DevConsole({ open, onToggle, entries, onClear, onCopy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  const colorMap: Record<string, string> = {
    cmd: '#4FC3F7',
    stdout: '#AAA',
    stderr: '#EF5350',
  };
  const prefixMap: Record<string, string> = {
    cmd: '$',
    stdout: '>',
    stderr: '!',
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={onToggle}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
        }}
      >
        {open ? '▼' : '▶'} DEVCONSOLE ({entries.length} lines)
      </button>

      {open && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <button onClick={onClear} style={btnStyle}>Clear</button>
            <button onClick={onCopy} style={btnStyle}>Copy All</button>
          </div>
          <div
            ref={ref}
            className="console-box"
            style={{ maxHeight: 200, overflow: 'auto' }}
          >
            {entries.length === 0 && (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No output yet</div>
            )}
            {entries.map((e, i) => (
              <div key={i} style={{ color: colorMap[e.type] || '#AAA' }}>
                {prefixMap[e.type] || ' '} {e.line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#333', color: '#CCC', border: 'none',
  borderRadius: 4, padding: '2px 10px', fontSize: 10,
  cursor: 'pointer',
};
