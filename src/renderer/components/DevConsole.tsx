import React, { useRef, useEffect } from 'react';
import { ChevronDown, Trash2, Copy } from 'lucide-react';

interface RawEntry { type: 'cmd' | 'stdout' | 'stderr'; line: string; }
interface Props {
  open: boolean;
  onToggle: () => void;
  entries: RawEntry[];
  onClear: () => void;
  onCopy: () => void;
}

function lineColor(type: string, line: string): string {
  if (type === 'cmd') return '#60A5FA';
  if (type === 'stderr' && /error/i.test(line)) return '#F87171';
  if (type === 'stderr') return '#FBBF24';
  return '#E2E8F0';
}

const prefixMap: Record<string, string> = { cmd: '$', stdout: '>', stderr: '!' };

export default function DevConsole({ open, onToggle, entries, onClear, onCopy }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      requestAnimationFrame(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
      });
    }
  }, [entries]);

  return (
    <div style={{ marginTop: 14 }}>
      <div className="flex items-center justify-between" style={{ padding: '12px 0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          DEVCONSOLE ({entries.length} lines)
        </span>
        <button
          onClick={onToggle}
          className="flex items-center no-drag"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
          }}
        >
          <ChevronDown
            size={14}
            style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </button>
      </div>

      {open && (
        <div>
          <div className="flex items-center" style={{ gap: 6, marginBottom: 8 }}>
            <button onClick={onClear} className="btn-ghost">
              <Trash2 size={12} /> Clear
            </button>
            <button onClick={onCopy} className="btn-ghost">
              <Copy size={12} /> Copy All
            </button>
          </div>
          <div ref={ref} className="console-box">
            {entries.length === 0 && (
              <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>No output yet</div>
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
