import React from 'react';
import { Film, X } from 'lucide-react';

interface Props {
  files: string[];
  onRemove?: (index: number) => void;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function FileList({ files, onRemove }: Props) {
  if (files.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        maxHeight: 160,
        overflowY: 'auto',
        marginBottom: 14,
      }}
    >
      {files.map((f, i) => {
        const name = f.split('\\').pop() || f.split('/').pop() || f;
        return (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              padding: '10px 14px',
              borderBottom: i < files.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--accent-soft)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Film size={14} />
            </div>
            <span style={{
              fontSize: 12,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {truncate(name, 50)}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(i)}
                title="Remove"
                style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--error-soft)';
                  e.currentTarget.style.color = 'var(--error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
