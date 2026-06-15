import React, { useState } from 'react';

interface Props {
  resolution: string; onResolutionChange: (v: string) => void;
  fps: string; onFpsChange: (v: string) => void;
  codec: string; onCodecChange: (v: string) => void;
  preset: string; onPresetChange: (v: string) => void;
  audio: string; onAudioChange: (v: string) => void;
  format: string; onFormatChange: (v: string) => void;
  origRes: string; origFps: number;
}

export default function AdvancedOptions(props: Props) {
  const [open, setOpen] = useState(false);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 34,
    fontSize: 13,
    padding: '0 8px',
    border: '1px solid var(--border)',
    borderRadius: 5,
    background: 'white',
    outline: 'none',
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: 4, padding: 0,
        }}
      >
        {open ? '▼' : '▶'} ADVANCED
      </button>

      {open && (
        <div style={{ background: '#F8F7FC', borderRadius: 8, padding: 14, marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 12px 1fr', gap: '10px 0' }}>
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>RESOLUTION</label>
              <select value={props.resolution} onChange={(e) => props.onResolutionChange(e.target.value)} style={selectStyle}>
                <option value="orig">Original ({props.origRes})</option>
                <option value="4k">4K (3840x2160)</option>
                <option value="1440p">1440p (2560x1440)</option>
                <option value="1080p">1080p (1920x1080)</option>
                <option value="720p">720p (1280x720)</option>
                <option value="480p">480p (854x480)</option>
                <option value="360p">360p (640x360)</option>
              </select>
            </div>
            <div />
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>FPS</label>
              <select value={props.fps} onChange={(e) => props.onFpsChange(e.target.value)} style={selectStyle}>
                <option value="orig">Original ({props.origFps})</option>
                <option value="60">60</option>
                <option value="30">30</option>
                <option value="24">24</option>
                <option value="15">15</option>
                <option value="10">10</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>CODEC</label>
              <select value={props.codec} onChange={(e) => props.onCodecChange(e.target.value)} style={selectStyle}>
                <option value="h264">H.264 (x264)</option>
                <option value="h265">H.265 (x265)</option>
              </select>
            </div>
            <div />
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>PRESET</label>
              <select value={props.preset} onChange={(e) => props.onPresetChange(e.target.value)} style={selectStyle}>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>AUDIO</label>
              <select value={props.audio} onChange={(e) => props.onAudioChange(e.target.value)} style={selectStyle}>
                <option value="keep">Keep original</option>
                <option value="reencode">Re-encode (AAC 128k)</option>
                <option value="remove">Remove audio</option>
              </select>
            </div>
            <div />
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>OUTPUT</label>
              <select value={props.format} onChange={(e) => props.onFormatChange(e.target.value)} style={selectStyle}>
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="webm">WebM</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
