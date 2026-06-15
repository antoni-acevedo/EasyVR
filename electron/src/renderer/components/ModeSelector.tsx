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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 8px 1fr 8px 1fr', margin: '0 0 14px 0' }}>
      {modes.map((m, i) => (
        <React.Fragment key={m.key}>
          <div
            className={`tab ${mode === m.key ? 'tab-active' : 'tab-inactive'}`}
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
