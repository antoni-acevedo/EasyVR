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
  origRes: string; origFps: number;
}

export default function AdvancedOptions(p: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <div className="flex-r items-center justify-between pad-y-16 cursor-pointer" onClick={()=>setOpen(!open)} style={{borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <span style={{color:'#FFFFFF',fontSize:11,fontWeight:500}}>Advanced</span>
        <ChevronDown size={14} style={{color:'#FFFFFF',transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0)'}} />
      </div>
      {open && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          <SelectBox label="Resolution" value={p.resolution} options={[
            { value: 'orig', label: 'Original' },
            { value: '4k', label: '4K' },
            { value: '1440p', label: '1440p' },
            { value: '1080p', label: '1080p' },
            { value: '720p', label: '720p' },
            { value: '480p', label: '480p' },
            { value: '360p', label: '360p' },
          ]} onChange={p.onResolutionChange} />
          <SelectBox label="FPS" value={p.fps} options={[
            { value: 'orig', label: 'Original' },
            { value: '60', label: '60' },
            { value: '30', label: '30' },
            { value: '24', label: '24' },
            { value: '15', label: '15' },
            { value: '10', label: '10' },
          ]} onChange={p.onFpsChange} />
          <SelectBox label="Codec" value={p.codec} options={[
            { value: 'h264', label: 'H.264 (x264)' },
            { value: 'h265', label: 'H.265 (x265)' },
          ]} onChange={p.onCodecChange} />
          <SelectBox label="Preset" value={p.preset} options={[
            { value: 'fast', label: 'Fast' },
            { value: 'medium', label: 'Medium' },
            { value: 'slow', label: 'Slow' },
          ]} onChange={p.onPresetChange} />
          <SelectBox label="Audio" value={p.audio} options={[
            { value: 'keep', label: 'Keep original' },
            { value: 'reencode', label: 'Re-encode (AAC 128k)' },
            { value: 'remove', label: 'Remove audio' },
          ]} onChange={p.onAudioChange} />
          <SelectBox label="Output" value={p.format} options={[
            { value: 'mp4', label: 'MP4' },
            { value: 'mkv', label: 'MKV' },
            { value: 'webm', label: 'WebM' },
          ]} onChange={p.onFormatChange} />
        </div>
      )}
    </div>
  );
}
