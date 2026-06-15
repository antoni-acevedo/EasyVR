import React from 'react';

type Mode = 'fixed' | 'percent' | 'crf';

interface Props { mode: Mode; onChange: (m: Mode) => void; }

const modes: { key: Mode; label: string }[] = [
  { key: 'fixed', label: 'Fixed Size' },
  { key: 'percent', label: 'Percent' },
  { key: 'crf', label: 'Quality' },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="grid grid-cols-[1fr_8px_1fr_8px_1fr] mb-[14px]">
      {modes.map((m, i) => (
        <React.Fragment key={m.key}>
          <div
            className={`py-[9px] rounded-lg cursor-pointer text-xs font-semibold text-center transition-all duration-200 ${
              mode === m.key
                ? 'text-white'
                : 'text-[#666] hover:bg-[#E5E5E5]'
            }`}
            style={{ background: mode === m.key ? 'var(--accent)' : '#F0F0F0' }}
            onClick={() => onChange(m.key)}
          >
            {m.label}
          </div>
          {i < modes.length - 1 && <div />}
        </React.Fragment>
      ))}
    </div>
  );
}
