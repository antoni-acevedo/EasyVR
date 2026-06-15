import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FixedSizeInput from './components/FixedSizeInput';
import PercentInput from './components/PercentInput';
import CRFInput from './components/CRFInput';
import AdvancedOptions from './components/AdvancedOptions';
import ProgressPanel from './components/ProgressPanel';
import DevConsole from './components/DevConsole';

type Mode = 'fixed' | 'percent' | 'crf';
interface FFmpegOptions { mode: Mode; filePath: string; targetSize?: number; percent?: number; crf?: number; resolution: string; fps: string; codec: string; preset: string; audio: string; format: string; maxPasses: number; }

export default function App() {
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [origRes, setOrigRes] = useState('');
  const [origFps, setOrigFps] = useState(0);
  const [mode, setMode] = useState<Mode>('fixed');
  const [targetSize, setTargetSize] = useState('8');
  const [percent, setPercent] = useState(50);
  const [crf, setCrf] = useState(23);
  const [resolution, setResolution] = useState('orig');
  const [fps, setFps] = useState('orig');
  const [codec, setCodec] = useState('h264');
  const [preset, setPreset] = useState('medium');
  const [audio, setAudio] = useState('keep');
  const [format, setFormat] = useState('mp4');
  const [isEncoding, setIsEncoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<{success: boolean; origMb: string; newMb: string; saved: string; outputName: string} | null>(null);
  const [rawEntries, setRawEntries] = useState<{type: 'cmd'|'stdout'|'stderr'; line: string}[]>([]);
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);
  useEffect(() => { (async () => { const fp = await window.electronAPI.getFilePath(); if (!fp) return; setFilePath(fp); setFileName(fp.split('\\').pop() || fp.split('/').pop() || ''); })(); }, []);

  const addLog = useCallback((msg: string) => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]), []);
  useEffect(() => {
    window.electronAPI.onProgress(d => { setProgress(d.percent); setStatusText(`Encoding... ${d.frame}/${d.totalFrames} frames (${d.percent}%)`); });
    window.electronAPI.onLog(m => addLog(m));
    window.electronAPI.onDone(d => { setProgress(100); setIsEncoding(false); setShowResult({success: true, origMb: (d.originalSize/(1024*1024)).toFixed(1), newMb: (d.finalSize/(1024*1024)).toFixed(1), saved: ((d.originalSize-d.finalSize)/(1024*1024)).toFixed(1), outputName: d.outputPath.split('\\').pop()||d.outputPath.split('/').pop()||''}); setStatusText('Complete!'); });
    window.electronAPI.onError(m => { setIsEncoding(false); setStatusText('Error'); addLog(`ERROR: ${m}`); });
    window.electronAPI.onRaw(d => setRawEntries(p => [...p, d]));
    return () => { window.electronAPI.removeAllListeners(); };
  }, [addLog]);

  const handleCompress = () => {
    if (!filePath) return;
    setIsEncoding(true); setProgress(0); setStatusText('Starting...');
    setLogs([]); setRawEntries([]); setShowResult(null); setDevConsoleOpen(true);
    const opts: FFmpegOptions = { filePath, mode, resolution, fps, codec, preset, audio, format, maxPasses: 2 };
    if (mode === 'fixed') { const mb = parseFloat(targetSize); if (isNaN(mb)||mb<=0) { setStatusText('Error'); setIsEncoding(false); return; } opts.targetSize = mb; }
    else if (mode === 'percent') opts.percent = percent;
    else opts.crf = crf;
    addLog(`Starting: ${fileName}, ${mode}`);
    window.electronAPI.startCompression(opts);
  };

  return (
    <div className="w-screen h-screen flex-r overflow-hidden font-sans select-none" style={{color:'white'}}>
      <Sidebar mode={mode} onChange={setMode} />
      <div className="flex-1 flex-c pad-6 overflow-hidden" style={{padding:6}}>
        <Header fileName={fileName} />
        <div className="flex-1 flex-c overflow-hidden pad-8" style={{background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>
          <div className="flex-1 overflow-y-auto">
            <div className="mar-b-12">
              <div className="fluent-label">Target Size</div>
              {mode === 'fixed' && <FixedSizeInput value={targetSize} onChange={setTargetSize} />}
              {mode === 'percent' && <PercentInput value={percent} onChange={setPercent} />}
              {mode === 'crf' && <CRFInput value={crf} onChange={setCrf} />}
            </div>
            <AdvancedOptions resolution={resolution} onResolutionChange={setResolution} fps={fps} onFpsChange={setFps} codec={codec} onCodecChange={setCodec} preset={preset} onPresetChange={setPreset} audio={audio} onAudioChange={setAudio} format={format} onFormatChange={setFormat} origRes={origRes} origFps={origFps} />
            <button className="w-full flex-r items-center justify-center gap-8 mar-t-16 pad-y-10 rounded-lg tracking-wide text-xs font-semibold" style={{background:'#4CC2F1', color:'#13161C', border:'none', cursor:'pointer', transition:'background 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}} onClick={handleCompress} disabled={isEncoding || !filePath}
              onMouseEnter={e=>{if(!e.currentTarget.disabled)e.currentTarget.style.background='#3FAEDC'}}
              onMouseLeave={e=>{if(!e.currentTarget.disabled)e.currentTarget.style.background='#4CC2F1'}}>
              <Zap size={16} /> {isEncoding ? 'COMPRESSING...' : 'COMPRESS VIDEO'}
            </button>
            <div className="mar-t-16">
              {(isEncoding||showResult) && <ProgressPanel progress={progress} statusText={statusText} logs={logs} logsRef={logsRef as React.RefObject<HTMLDivElement>} result={showResult} onCloseResult={()=>setShowResult(null)} />}
              <DevConsole open={devConsoleOpen} onToggle={()=>setDevConsoleOpen(!devConsoleOpen)} entries={rawEntries} onClear={()=>setRawEntries([])} onCopy={()=>navigator.clipboard.writeText(rawEntries.map(e=>`${e.type}: ${e.line}`).join('\n'))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
