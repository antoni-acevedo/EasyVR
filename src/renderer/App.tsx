import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import Sidebar, { View } from './components/Sidebar';
import TopBar from './components/Header';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import FormatChips from './components/FormatChips';
import FixedSizeInput from './components/FixedSizeInput';
import PercentInput from './components/PercentInput';
import CRFInput from './components/CRFInput';
import AdvancedOptions from './components/AdvancedOptions';
import ProgressPanel from './components/ProgressPanel';
import DevConsole from './components/DevConsole';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import BatchResult, { BatchFileEntry } from './components/BatchResult';
import SplashScreen from './components/SplashScreen';

type Mode = 'fixed' | 'percent' | 'crf';

const VIEW_META: Record<View, { title: string; description: string }> = {
  fixed:    { title: 'Fixed Size', description: 'Resize your video to a fixed target size' },
  percent:  { title: 'Percent',    description: 'Resize your video by a percentage of the original' },
  quality:  { title: 'Quality',    description: 'Adjust video quality with a CRF value' },
  settings: { title: 'Settings',   description: 'App preferences and configuration' },
  about:    { title: 'About',      description: 'Information about EasyVR' },
};

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [view, setView] = useState<View>('fixed');
  const [files, setFiles] = useState<string[]>([]);
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
  const [showResult, setShowResult] = useState<{ success: boolean; origMb: string; newMb: string; saved: string; outputName: string } | null>(null);
  const [rawEntries, setRawEntries] = useState<{ type: 'cmd' | 'stdout' | 'stderr'; line: string }[]>([]);
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(0);
  const [batchTotalFiles, setBatchTotalFiles] = useState(0);
  const [batchCurrentFileName, setBatchCurrentFileName] = useState('');
  const [batchResults, setBatchResults] = useState<BatchFileEntry[]>([]);
  const [showBatchResult, setShowBatchResult] = useState(false);

  const isBatchRef = useRef(false);
  isBatchRef.current = files.length > 1;

  const addLog = useCallback((msg: string) => {
    setLogs((p) => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    (async () => {
      const f = await window.electronAPI.getFiles();
      const argv = await window.electronAPI.getRawArgv();
      setRawEntries(p => [...p, { type: 'cmd' as const, line: `argv: ${JSON.stringify(argv)}` }]);
      if (f && f.length > 0) setFiles(f);
    })();
  }, []);

  useEffect(() => {
    window.electronAPI.onProgress((d) => {
      setProgress(d.percent);
      setStatusText(`Encoding... ${d.frame}/${d.totalFrames} frames (${d.percent}%)`);
    });
    window.electronAPI.onLog((m) => addLog(m));
    window.electronAPI.onDone((d) => {
      if (!isBatchRef.current) {
        setProgress(100);
        setIsEncoding(false);
        setShowResult({
          success: true,
          origMb: (d.originalSize / (1024 * 1024)).toFixed(1),
          newMb: (d.finalSize / (1024 * 1024)).toFixed(1),
          saved: ((d.originalSize - d.finalSize) / (1024 * 1024)).toFixed(1),
          outputName: d.outputPath.split('\\').pop() || d.outputPath.split('/').pop() || '',
        });
        setStatusText('Complete!');
      }
    });
    window.electronAPI.onError((m) => {
      if (!isBatchRef.current) {
        setIsEncoding(false);
        setStatusText('Error');
      }
      addLog(`ERROR: ${m}`);
      setRawEntries((p) => [...p, { type: 'stderr', line: `ERROR: ${m}` }]);
    });
    window.electronAPI.onRaw((d) => setRawEntries((p) => [...p, d]));
    window.electronAPI.onBatchFileStart((d) => {
      setBatchCurrentIndex(d.fileIndex);
      setBatchTotalFiles(d.totalFiles);
      setBatchCurrentFileName(d.fileName);
      setProgress(0);
      setStatusText(`File ${d.fileIndex}/${d.totalFiles}: ${d.fileName}`);
    });
    window.electronAPI.onBatchFileComplete((d) => {
      setBatchResults((p) => [
        ...p,
        {
          fileName: d.fileName,
          success: d.success,
          originalSize: d.originalSize,
          finalSize: d.finalSize,
          outputPath: d.outputPath,
        },
      ]);
    });
    window.electronAPI.onBatchDone(() => {
      setIsEncoding(false);
      setShowBatchResult(true);
      setProgress(100);
      setStatusText('Batch complete!');
    });
    return () => {
      window.electronAPI.removeAllListeners();
    };
  }, [addLog]);

  const handleViewChange = (v: View) => {
    setView(v);
    if (v === 'fixed') setMode('fixed');
    if (v === 'percent') setMode('percent');
    if (v === 'quality') setMode('crf');
    setShowResult(null);
    setShowBatchResult(false);
  };

  const buildOptions = () => {
    const opts: any = { mode, resolution, fps, codec, preset, audio, format, maxPasses: 2 };
    if (mode === 'fixed') {
      const mb = parseFloat(targetSize);
      if (isNaN(mb) || mb <= 0) return null;
      opts.targetSize = mb;
    } else if (mode === 'percent') {
      opts.percent = percent;
    } else {
      opts.crf = crf;
    }
    return opts;
  };

  const handleCompress = () => {
    if (files.length === 0) return;
    const opts = buildOptions();
    if (!opts) {
      setStatusText('Error');
      return;
    }
    setDevConsoleOpen(true);
    setRawEntries((p) => [
      ...p,
      { type: 'cmd', line: `Compressing ${files.length} file(s), mode: ${mode}` },
    ]);
    setIsEncoding(true);
    setProgress(0);
    setStatusText('Starting...');
    setLogs([]);
    setShowResult(null);
    setShowBatchResult(false);
    setBatchResults([]);
    if (isBatchRef.current) {
      window.electronAPI.startBatchCompression(files, opts);
    } else {
      window.electronAPI.startCompression({ ...opts, filePath: files[0] });
    }
  };

  const handleFilesSelected = (newFiles: string[]) => {
    setFiles(newFiles);
    setShowResult(null);
    setShowBatchResult(false);
  };

  const handleRemoveFile = (index: number) => {
    if (isEncoding) return;
    setFiles((p) => p.filter((_, i) => i !== index));
  };

  const fileName = files.length === 1
    ? files[0].split('\\').pop() || files[0].split('/').pop() || ''
    : '';
  const isBatch = isBatchRef.current;
  const meta = VIEW_META[view];

  const renderMode = () => {
    if (mode === 'fixed') return <FixedSizeInput value={targetSize} onChange={setTargetSize} />;
    if (mode === 'percent') return <PercentInput value={percent} onChange={setPercent} />;
    return <CRFInput value={crf} onChange={setCrf} />;
  };

  const renderContent = () => {
    if (view === 'settings') return <SettingsView />;
    if (view === 'about') return <AboutView />;

    return (
      <>
        {files.length === 0 ? (
          <div className="flex flex-col items-center" style={{ marginTop: 24 }}>
            <DropZone onFilesSelected={handleFilesSelected} />
            <FormatChips />
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {isBatch && !isEncoding && !showBatchResult && (
              <FileList files={files} onRemove={handleRemoveFile} />
            )}

            {!isBatch && !isEncoding && !showResult && (
              <div
                className="surface"
                style={{ padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Zap size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Selected video</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fileName}
                  </div>
                </div>
                {!isEncoding && (
                  <button onClick={() => setFiles([])} className="btn-ghost">
                    Change
                  </button>
                )}
              </div>
            )}

            <div className="surface" style={{ padding: 18, marginBottom: 14 }}>
              <label className="label-base">Target</label>
              {renderMode()}
            </div>

            <AdvancedOptions
              resolution={resolution}
              onResolutionChange={setResolution}
              fps={fps}
              onFpsChange={setFps}
              codec={codec}
              onCodecChange={setCodec}
              preset={preset}
              onPresetChange={setPreset}
              audio={audio}
              onAudioChange={setAudio}
              format={format}
              onFormatChange={setFormat}
            />

            <button
              className="btn-primary"
              style={{ width: '100%', height: 48, marginTop: 14, fontSize: 14 }}
              onClick={handleCompress}
              disabled={isEncoding}
            >
              <Zap size={16} />
              {isEncoding
                ? 'COMPRESSING…'
                : isBatch
                  ? `COMPRESS ALL (${files.length} FILES)`
                  : 'COMPRESS VIDEO'}
            </button>

            <ProgressPanel
              progress={progress}
              statusText={statusText}
              result={showResult}
              onCloseResult={() => setShowResult(null)}
            />

            {showBatchResult && (
              <BatchResult results={batchResults} onClose={() => setShowBatchResult(false)} />
            )}

            <DevConsole
              open={devConsoleOpen}
              onToggle={() => setDevConsoleOpen(!devConsoleOpen)}
              entries={rawEntries}
              onClear={() => setRawEntries([])}
              onCopy={() => navigator.clipboard.writeText(rawEntries.map((e) => `${e.type}: ${e.line}`).join('\n'))}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <SplashScreen visible={splashVisible} onDone={() => setSplashVisible(false)} />
      <Sidebar view={view} onChange={handleViewChange} />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
        <TopBar title={meta.title} description={meta.description} />
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: '8px 28px 24px 28px' }}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
