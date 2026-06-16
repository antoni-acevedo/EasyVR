import React from 'react';
import { Film, X } from 'lucide-react';

interface Props {
  files: string[];
  onRemove?: (index: number) => void;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

export default function FileList({ files, onRemove }: Props) {
  return (
    <div className="file-list">
      {files.map((f, i) => {
        const name = f.split('\\').pop() || f.split('/').pop() || f;
        return (
          <div key={i} className="file-list-item">
            <Film size={14} strokeWidth={1.5} style={{ color: '#717D8E', flexShrink: 0 }} />
            <span className="file-list-name">{truncate(name, 40)}</span>
            {onRemove && (
              <button
                className="file-list-remove"
                onClick={() => onRemove(i)}
                title="Remove"
              >
                <X size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
