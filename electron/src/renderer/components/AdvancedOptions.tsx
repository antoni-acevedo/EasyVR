import React from 'react';
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

const s = (p: string, fn: (v: string) => void) => ({ value: p, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => fn(e.target.value) });

export default function AdvancedOptions(p: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <div className="flex-r items-center justify-between pad-y-16 cursor-pointer" onClick={()=>setOpen(!open)} style={{borderTop:'1px solid rgba(30,41,59,0.4)',borderBottom:'1px solid rgba(30,41,59,0.4)'}}>
        <span style={{color:'#FFFFFF',fontSize:11,letterSpacing:'0.05em',textTransform:'uppercase'}}>Advanced</span>
        <ChevronDown size={14} style={{color:'#FFFFFF',transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0)'}} />
      </div>
      {open && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
          <div><div className="fluent-label">Resolution</div>
            <select {...s(p.resolution, p.onResolutionChange)} className="fluent-select w-full">
              <option value="orig">Original ({p.origRes})</option>
              <option value="4k">4K</option><option value="1440p">1440p</option><option value="1080p">1080p</option>
              <option value="720p">720p</option><option value="480p">480p</option><option value="360p">360p</option>
            </select>
          </div>
          <div><div className="fluent-label">FPS</div>
            <select {...s(p.fps, p.onFpsChange)} className="fluent-select w-full">
              <option value="orig">Original ({p.origFps})</option>
              <option value="60">60</option><option value="30">30</option><option value="24">24</option><option value="15">15</option><option value="10">10</option>
            </select>
          </div>
          <div><div className="fluent-label">Codec</div>
            <select {...s(p.codec, p.onCodecChange)} className="fluent-select w-full">
              <option value="h264">H.264 (x264)</option><option value="h265">H.265 (x265)</option>
            </select>
          </div>
          <div><div className="fluent-label">Preset</div>
            <select {...s(p.preset, p.onPresetChange)} className="fluent-select w-full">
              <option value="fast">Fast</option><option value="medium">Medium</option><option value="slow">Slow</option>
            </select>
          </div>
          <div><div className="fluent-label">Audio</div>
            <select {...s(p.audio, p.onAudioChange)} className="fluent-select w-full">
              <option value="keep">Keep original</option><option value="reencode">Re-encode (AAC 128k)</option><option value="remove">Remove audio</option>
            </select>
          </div>
          <div><div className="fluent-label">Output</div>
            <select {...s(p.format, p.onFormatChange)} className="fluent-select w-full">
              <option value="mp4">MP4</option><option value="mkv">MKV</option><option value="webm">WebM</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
