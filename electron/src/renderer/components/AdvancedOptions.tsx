import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

  return (
    <div>
      <div
        className="flex items-center justify-between py-4 border-t border-b border-slate-800/40 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[11px] tracking-wider text-slate-400 uppercase">Advanced</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <label className="fluent-label">Resolution</label>
            <select value={props.resolution} onChange={(e) => props.onResolutionChange(e.target.value)} className="fluent-select w-full">
              <option value="orig">Original ({props.origRes})</option>
              <option value="4k">4K</option>
              <option value="1440p">1440p</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
            </select>
          </div>
          <div>
            <label className="fluent-label">FPS</label>
            <select value={props.fps} onChange={(e) => props.onFpsChange(e.target.value)} className="fluent-select w-full">
              <option value="orig">Original ({props.origFps})</option>
              <option value="60">60</option>
              <option value="30">30</option>
              <option value="24">24</option>
              <option value="15">15</option>
              <option value="10">10</option>
            </select>
          </div>
          <div>
            <label className="fluent-label">Codec</label>
            <select value={props.codec} onChange={(e) => props.onCodecChange(e.target.value)} className="fluent-select w-full">
              <option value="h264">H.264 (x264)</option>
              <option value="h265">H.265 (x265)</option>
            </select>
          </div>
          <div>
            <label className="fluent-label">Preset</label>
            <select value={props.preset} onChange={(e) => props.onPresetChange(e.target.value)} className="fluent-select w-full">
              <option value="fast">Fast</option>
              <option value="medium">Medium</option>
              <option value="slow">Slow</option>
            </select>
          </div>
          <div>
            <label className="fluent-label">Audio</label>
            <select value={props.audio} onChange={(e) => props.onAudioChange(e.target.value)} className="fluent-select w-full">
              <option value="keep">Keep original</option>
              <option value="reencode">Re-encode (AAC 128k)</option>
              <option value="remove">Remove audio</option>
            </select>
          </div>
          <div>
            <label className="fluent-label">Output</label>
            <select value={props.format} onChange={(e) => props.onFormatChange(e.target.value)} className="fluent-select w-full">
              <option value="mp4">MP4</option>
              <option value="mkv">MKV</option>
              <option value="webm">WebM</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
