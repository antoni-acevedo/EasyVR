import React from 'react';
import { FolderOpen } from 'lucide-react';

interface Props {
  onFilesSelected: (files: string[]) => void;
}

export default function FilePicker({ onFilesSelected }: Props) {
  const handleBrowse = async () => {
    const files = await window.electronAPI.openFileDialog();
    if (files && files.length > 0) onFilesSelected(files);
  };

  return (
    <div className="flex-c items-center justify-center flex-1">
      <div className="file-picker-box" onClick={handleBrowse}>
        <div className="file-picker-icon">
          <FolderOpen size={40} strokeWidth={1.5} />
        </div>
        <div className="file-picker-text">No file selected</div>
        <div className="file-picker-sub">Click to browse or drag a video file</div>
        <button className="file-picker-btn" onClick={(e) => { e.stopPropagation(); handleBrowse(); }}>
          Browse Files
        </button>
      </div>
    </div>
  );
}
