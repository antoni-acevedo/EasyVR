import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
}

const selectedLabel = (opts: Option[], val: string) => {
  const opt = opts.find(o => o.value === val);
  return opt ? opt.label : val;
};

export default function SelectBox({ label, value, options, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#8A96A8', marginBottom: 6, display: 'block' }}>{label}</label>
      <div
        className="flex-r items-center justify-between w-full"
        style={{
          height: 40,
          background: 'rgba(19,22,28,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '0 12px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(19,22,28,0.25)'; }}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(19,22,28,0.15)'; } }}
      >
        <span style={{ fontSize: 12, color: '#E2E8F0' }}>{selectedLabel(options, value)}</span>
        <ChevronDown
          size={14}
          style={{
            color: '#64748b',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: 4,
            background: 'rgba(19,22,28,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              style={{
                padding: '10px 12px',
                fontSize: 12,
                color: opt.value === value ? '#4CC2F1' : '#E2E8F0',
                cursor: 'pointer',
                transition: 'background 0.1s',
                background: opt.value === value ? 'rgba(76,194,241,0.08)' : 'transparent',
              }}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = opt.value === value ? 'rgba(76,194,241,0.08)' : 'transparent'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
