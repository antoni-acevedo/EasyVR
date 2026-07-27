import React from 'react';
import { ChevronDown } from 'lucide-react';
import SelectBox from './SelectBox';

interface Props {
  resolution: string; onResolutionChange: (v: string) => void;
  fps: string; onFpsChange: (v: string) => void;
  codec: string; onCodecChange: (v: string) => void;
  preset: string; onPresetChange: (v: string) => void;
  audio: string; onAudioChange: (v: string) => void;
  format: string; onFormatChange: (v: string) => void;
}

export default function AdvancedOptions(p: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="surface" style={{ padding: 0, marginTop: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full"
        style={{
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border-soft)' : 'none',
          borderRadius: open ? '20px 20px 0 0' : 20,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Advanced
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>
      {open && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          padding: 18,
        }}>
          <SelectBox label="Resolution" value={p.resolution} onChange={p.onResolutionChange} options={[
            { value: 'orig', label: 'Original' },
            { value: '4k', label: '4K' },
            { value: '1440p', label: '1440p' },
            { value: '1080p', label: '1080p' },
            { value: '720p', label: '720p' },
            { value: '480p', label: '480p' },
            { value: '360p', label: '360p' },
          ]} />
          <SelectBox label="FPS" value={p.fps} onChange={p.onFpsChange} options={[
            { value: 'orig', label: 'Original' },
            { value: '60', label: '60' },
            { value: '30', label: '30' },
            { value: '24', label: '24' },
            { value: '15', label: '15' },
            { value: '10', label: '10' },
          ]} />
          <SelectBox label="Codec" value={p.codec} onChange={p.onCodecChange} options={[
            { value: 'h264', label: 'H.264 (x264)' },
            { value: 'h265', label: 'H.265 (x265)' },
          ]} />
          <SelectBox label="Preset" value={p.preset} onChange={p.onPresetChange} options={[
            { value: 'fast', label: 'Fast' },
            { value: 'medium', label: 'Medium' },
            { value: 'slow', label: 'Slow' },
          ]} />
          <SelectBox label="Audio" value={p.audio} onChange={p.onAudioChange} options={[
            { value: 'keep', label: 'Keep original' },
            { value: 'reencode', label: 'Re-encode (AAC 128k)' },
            { value: 'remove', label: 'Remove audio' },
          ]} />
          <SelectBox label="Output" value={p.format} onChange={p.onFormatChange} options={[
            { value: 'mp4', label: 'MP4' },
            { value: 'mkv', label: 'MKV' },
            { value: 'webm', label: 'WebM' },
          ]} />
        </div>
      )}
    </div>
  );
}
