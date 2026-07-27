import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string; }

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
}

export default function SelectBox({ label, value, options, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label className="label-base">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full"
        style={{
          height: 42,
          background: 'var(--bg-input)',
          border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border-color)'}`,
          borderRadius: 10,
          padding: '0 12px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
          {selected ? selected.label : value}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.15s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  color: active ? 'var(--accent)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'var(--bg-soft)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
