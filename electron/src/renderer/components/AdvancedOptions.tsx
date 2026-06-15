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

const selClass = "w-full h-[34px] text-sm px-2 border border-[var(--border)] rounded outline-none bg-white";

export default function AdvancedOptions(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="bg-none border-none cursor-pointer text-[11px] font-semibold flex items-center gap-1 p-0"
        style={{ color: 'var(--text-secondary)' }}
      >
        {open ? '▼' : '▶'} ADVANCED
      </button>

      {open && (
        <div className="bg-[#F8F7FC] rounded-lg p-[14px] mt-2">
          <div className="grid grid-cols-[1fr_12px_1fr] gap-y-[10px] gap-x-0">
            <div>
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>RESOLUTION</label>
              <select value={props.resolution} onChange={(e) => props.onResolutionChange(e.target.value)} className={selClass}>
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
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>FPS</label>
              <select value={props.fps} onChange={(e) => props.onFpsChange(e.target.value)} className={selClass}>
                <option value="orig">Original ({props.origFps})</option>
                <option value="60">60</option>
                <option value="30">30</option>
                <option value="24">24</option>
                <option value="15">15</option>
                <option value="10">10</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>CODEC</label>
              <select value={props.codec} onChange={(e) => props.onCodecChange(e.target.value)} className={selClass}>
                <option value="h264">H.264 (x264)</option>
                <option value="h265">H.265 (x265)</option>
              </select>
            </div>
            <div />
            <div>
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>PRESET</label>
              <select value={props.preset} onChange={(e) => props.onPresetChange(e.target.value)} className={selClass}>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>AUDIO</label>
              <select value={props.audio} onChange={(e) => props.onAudioChange(e.target.value)} className={selClass}>
                <option value="keep">Keep original</option>
                <option value="reencode">Re-encode (AAC 128k)</option>
                <option value="remove">Remove audio</option>
              </select>
            </div>
            <div />
            <div>
              <label className="text-[9px] font-bold block mb-[3px]" style={{ color: 'var(--text-secondary)' }}>OUTPUT</label>
              <select value={props.format} onChange={(e) => props.onFormatChange(e.target.value)} className={selClass}>
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
