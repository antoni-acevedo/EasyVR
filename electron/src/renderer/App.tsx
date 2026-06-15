import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import FixedSizeInput from './components/FixedSizeInput';
import PercentInput from './components/PercentInput';
import CRFInput from './components/CRFInput';
import AdvancedOptions from './components/AdvancedOptions';
import ProgressPanel from './components/ProgressPanel';

type Mode = 'fixed' | 'percent' | 'crf';

interface FFmpegOptions {
  mode: Mode;
  targetSize?: number;
  percent?: number;
  crf?: number;
  resolution: string;
  fps: string;
  codec: string;
  preset: string;
  audio: string;
  format: string;
  maxPasses: number;
}

export default function App() {
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [duration, setDuration] = useState(0);
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
  const [showResult, setShowResult] = useState<{
    success: boolean; origMb: string; newMb: string; saved: string; outputName: string;
  } | null>(null);

  const logsRef = useRef<HTMLDivElement>(null);

  // Scroll logs
  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  // Init: get file path and info
  useEffect(() => {
    (async () => {
      const fp = await window.electronAPI.getFilePath();
      if (!fp) return;
      setFilePath(fp);
      const name = fp.split('\\').pop() || fp.split('/').pop() || '';
      setFileName(name);
    })();
  }, []);

  // IPC listeners
  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    window.electronAPI.onProgress((data) => {
      setProgress(data.percent);
      setStatusText(`Encoding... ${data.frame}/${data.totalFrames} frames (${data.percent}%)`);
    });

    window.electronAPI.onLog((msg) => {
      addLog(msg);
    });

    window.electronAPI.onDone((data) => {
      setProgress(100);
      setIsEncoding(false);
      setShowResult({
        success: true,
        origMb: (data.originalSize / (1024 * 1024)).toFixed(1),
        newMb: (data.finalSize / (1024 * 1024)).toFixed(1),
        saved: ((data.originalSize - data.finalSize) / (1024 * 1024)).toFixed(1),
        outputName: data.outputPath.split('\\').pop() || data.outputPath.split('/').pop() || '',
      });
      setStatusText('Complete!');
    });

    window.electronAPI.onError((msg) => {
      setIsEncoding(false);
      setStatusText('Error');
      addLog(`ERROR: ${msg}`);
    });

    return () => { window.electronAPI.removeAllListeners(); };
  }, [addLog]);

  const handleCompress = () => {
    if (!filePath) return;

    setIsEncoding(true);
    setProgress(0);
    setStatusText('Starting...');
    setLogs([]);
    setShowResult(null);

    const opts: FFmpegOptions = {
      mode,
      resolution,
      fps,
      codec,
      preset,
      audio,
      format,
      maxPasses: 2,
    };

    if (mode === 'fixed') {
      const mb = parseFloat(targetSize);
      if (isNaN(mb) || mb <= 0) { setStatusText('Error: enter a valid size'); setIsEncoding(false); return; }
      opts.targetSize = mb;
    } else if (mode === 'percent') {
      opts.percent = percent;
    } else {
      opts.crf = crf;
    }

    addLog(`Starting: ${fileName}, mode: ${mode}`);
    window.electronAPI.startCompression(opts);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Title bar */}
      <Header fileName={fileName} fileSize={fileSize} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2">
        {/* Mode */}
        <ModeSelector mode={mode} onChange={setMode} />

        {/* Mode-specific inputs */}
        {mode === 'fixed' && <FixedSizeInput value={targetSize} onChange={setTargetSize} />}
        {mode === 'percent' && <PercentInput value={percent} onChange={setPercent} />}
        {mode === 'crf' && <CRFInput value={crf} onChange={setCrf} />}

        {/* Advanced */}
        <AdvancedOptions
          resolution={resolution} onResolutionChange={setResolution}
          fps={fps} onFpsChange={setFps}
          codec={codec} onCodecChange={setCodec}
          preset={preset} onPresetChange={setPreset}
          audio={audio} onAudioChange={setAudio}
          format={format} onFormatChange={setFormat}
          origRes={origRes} origFps={origFps}
        />

        {/* Compress button */}
        <button
          className="btn-primary w-full mt-4"
          onClick={handleCompress}
          disabled={isEncoding || !filePath}
        >
          {isEncoding ? 'COMPRESSING...' : 'COMPRESS VIDEO'}
        </button>

        {/* Progress */}
        {(isEncoding || showResult) && (
          <ProgressPanel
            progress={progress}
            statusText={statusText}
            logs={logs}
            logsRef={logsRef as React.RefObject<HTMLDivElement>}
            result={showResult}
            onCloseResult={() => setShowResult(null)}
          />
        )}
      </div>
    </div>
  );
}
