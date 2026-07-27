import React, { useState, useRef, DragEvent } from 'react';
import { FolderOpen, Film } from 'lucide-react';

interface Props {
  onFilesSelected: (files: string[]) => void;
}

export default function DropZone({ onFilesSelected }: Props) {
  const [isHover, setIsHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = async () => {
    const files = await window.electronAPI.openFileDialog();
    if (files && files.length > 0) onFilesSelected(files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const paths = files
      .map((f) => window.electronAPI.getPathForFile(f))
      .filter(Boolean);
    if (paths.length > 0) onFilesSelected(paths);
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isHover) setIsHover(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHover(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHover(false);
    const files = Array.from(e.dataTransfer.files || []);
    const paths = files
      .map((f) => window.electronAPI.getPathForFile(f))
      .filter(Boolean);
    if (paths.length > 0) onFilesSelected(paths);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mp4,.mkv,.avi,.mov,.wmv,.m4v,.ts,.mts,.3gp,.webm,.flv"
        multiple
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <div
        className={`dropzone w-full max-w-[520px] ${isHover ? 'is-hover' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <FolderOpen size={40} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          No file selected
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320 }}>
          Click to browse or drag a video file here
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            className="btn-primary"
            onClick={(e) => { e.stopPropagation(); handleBrowse(); }}
          >
            <Film size={14} /> Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}
