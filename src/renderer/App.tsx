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
import FilePicker from './components/FilePicker';
import FileList from './components/FileList';
import BatchResult, { BatchFileEntry } from './components/BatchResult';

type Mode = 'fixed' | 'percent' | 'crf';

export default function App() {
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
  const [showResult, setShowResult] = useState<{success: boolean; origMb: string; newMb: string; saved: string; outputName: string} | null>(null);
  const [rawEntries, setRawEntries] = useState<{type: 'cmd'|'stdout'|'stderr'; line: string}[]>([]);
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(0);
  const [batchTotalFiles, setBatchTotalFiles] = useState(0);
  const [batchCurrentFileName, setBatchCurrentFileName] = useState('');
  const [batchResults, setBatchResults] = useState<BatchFileEntry[]>([]);
  const [showBatchResult, setShowBatchResult] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const isBatchRef = useRef(false);
  isBatchRef.current = files.length > 1;

  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

  useEffect(() => {
    (async () => {
      const f = await window.electronAPI.getFiles();
      const argv = await window.electronAPI.getRawArgv();
      setRawEntries(p => [...p, { type: 'cmd' as const, line: `argv: ${JSON.stringify(argv)}` }]);
      if (f && f.length > 0) setFiles(f);
    })();
  }, []);

  useEffect(() => {
    window.electronAPI.onNewFiles((newFiles: string[]) => {
      setRawEntries(p => [...p, { type: 'cmd' as const, line: `new-files: ${JSON.stringify(newFiles)}` }]);
      setFiles(p => [...p, ...newFiles.filter(f => !p.includes(f))]);
    });
  }, []);

  const addLog = useCallback((msg: string) => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]), []);

  useEffect(() => {
    window.electronAPI.onProgress(d => { setProgress(d.percent); setStatusText(`Encoding... ${d.frame}/${d.totalFrames} frames (${d.percent}%)`); });
    window.electronAPI.onLog(m => addLog(m));
    window.electronAPI.onDone(d => {
      if (!isBatchRef.current) {
        setProgress(100); setIsEncoding(false);
        setShowResult({
          success: true,
          origMb: (d.originalSize/(1024*1024)).toFixed(1),
          newMb: (d.finalSize/(1024*1024)).toFixed(1),
          saved: ((d.originalSize-d.finalSize)/(1024*1024)).toFixed(1),
          outputName: d.outputPath.split('\\').pop()||d.outputPath.split('/').pop()||'',
        });
        setStatusText('Complete!');
      }
    });
    window.electronAPI.onError(m => {
      if (!isBatchRef.current) { setIsEncoding(false); setStatusText('Error'); }
      addLog(`ERROR: ${m}`);
      setRawEntries(p => [...p, {type:'stderr' as const, line:`ERROR: ${m}`}]);
    });
    window.electronAPI.onRaw(d => setRawEntries(p => [...p, d]));
    window.electronAPI.onBatchFileStart(d => {
      setBatchCurrentIndex(d.fileIndex);
      setBatchTotalFiles(d.totalFiles);
      setBatchCurrentFileName(d.fileName);
      setProgress(0);
      setStatusText(`File ${d.fileIndex}/${d.totalFiles}: ${d.fileName}`);
    });
    window.electronAPI.onBatchFileComplete(d => {
      setBatchResults(p => [...p, {
        fileName: d.fileName,
        success: d.success,
        originalSize: d.originalSize,
        finalSize: d.finalSize,
        outputPath: d.outputPath,
      }]);
    });
    window.electronAPI.onBatchDone(() => {
      setIsEncoding(false);
      setShowBatchResult(true);
      setProgress(100);
      setStatusText('Batch complete!');
    });
    return () => { window.electronAPI.removeAllListeners(); };
  }, [addLog]);

  const buildOptions = () => {
    const opts: any = { mode, resolution, fps, codec, preset, audio, format, maxPasses: 2 };
    if (mode === 'fixed') { const mb = parseFloat(targetSize); if (isNaN(mb)||mb<=0) return null; opts.targetSize = mb; }
    else if (mode === 'percent') opts.percent = percent;
    else opts.crf = crf;
    return opts;
  };

  const handleCompress = () => {
    setDevConsoleOpen(true);
    if (files.length === 0) return;
    const opts = buildOptions();
    if (!opts) { setStatusText('Error'); return; }
    const fileList = files;
    setRawEntries(p => [...p, {type:'cmd' as const, line:`Compressing ${fileList.length} file(s), mode: ${mode}`}]);
    setIsEncoding(true); setProgress(0); setStatusText('Starting...');
    setLogs([]); setShowResult(null); setShowBatchResult(false); setBatchResults([]);
    if (isBatchRef.current) {
      window.electronAPI.startBatchCompression(fileList, opts);
    } else {
      window.electronAPI.startCompression({ ...opts, filePath: fileList[0] });
    }
  };

  const handleFilesSelected = (newFiles: string[]) => {
    setFiles(newFiles);
    setShowResult(null);
    setShowBatchResult(false);
  };

  const handleRemoveFile = (index: number) => {
    if (isEncoding) return;
    setFiles(p => p.filter((_, i) => i !== index));
  };

  const batchHeaderInfo = batchCurrentFileName
    ? `File ${batchCurrentIndex}/${batchTotalFiles}: ${batchCurrentFileName}`
    : '';

  const fileName = files.length === 1
    ? (files[0].split('\\').pop() || files[0].split('/').pop() || '')
    : '';

  const isBatch = isBatchRef.current;

  return (
    <div className="w-screen h-screen flex-r overflow-hidden font-sans select-none" style={{color:'white'}}>
      <Sidebar mode={mode} onChange={setMode} />
      <div className="flex-1 flex-c pad-4 overflow-hidden" style={{padding:4}}>
        <Header fileName={fileName} fileCount={files.length} batchCurrent={batchHeaderInfo || undefined} />
        <div className="flex-1 flex-c overflow-hidden" style={{padding:15, background:'rgba(59, 105, 223, 0.12)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16}}>
          <div className="flex-1 overflow-y-auto">
            {files.length === 0 ? (
              <FilePicker onFilesSelected={handleFilesSelected} />
            ) : (
              <>
                {isBatch && !isEncoding && !showBatchResult && (
                  <div className="mar-b-12">
                    <FileList files={files} onRemove={handleRemoveFile} />
                  </div>
                )}
                <div className="mar-b-12">
                  <div className="fluent-label">Target Size</div>
                  {mode === 'fixed' && <FixedSizeInput value={targetSize} onChange={setTargetSize} />}
                  {mode === 'percent' && <PercentInput value={percent} onChange={setPercent} />}
                  {mode === 'crf' && <CRFInput value={crf} onChange={setCrf} />}
                </div>
                <AdvancedOptions resolution={resolution} onResolutionChange={setResolution} fps={fps} onFpsChange={setFps} codec={codec} onCodecChange={setCodec} preset={preset} onPresetChange={setPreset} audio={audio} onAudioChange={setAudio} format={format} onFormatChange={setFormat} origRes={''} origFps={0} />
                <button className="w-full flex-r items-center justify-center gap-8 mar-t-16 pad-y-10 rounded-lg tracking-wide text-xs font-semibold"
                  style={{background: isEncoding ? 'rgba(76,194,241,0.5)' : '#4CC2F1', color:'#13161C', border:'none', cursor: isEncoding ? 'not-allowed' : 'pointer', transition:'background 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}
                  onClick={handleCompress} disabled={isEncoding}
                  onMouseEnter={e=>{if(!e.currentTarget.disabled)e.currentTarget.style.background='#3FAEDC'}}
                  onMouseLeave={e=>{if(!e.currentTarget.disabled)e.currentTarget.style.background='#4CC2F1'}}>
                  <Zap size={16} />
                  {isEncoding ? 'COMPRESSING...' : isBatch ? `COMPRESS ALL (${files.length} FILES)` : 'COMPRESS VIDEO'}
                </button>
                <div className="mar-t-16">
                  {showBatchResult ? (
                    <BatchResult results={batchResults} onClose={() => setShowBatchResult(false)} />
                  ) : (
                    (isEncoding || showResult) && <ProgressPanel progress={progress} statusText={statusText} logs={logs} logsRef={logsRef as React.RefObject<HTMLDivElement>} result={showResult} onCloseResult={() => setShowResult(null)} />
                  )}
                  <DevConsole open={devConsoleOpen} onToggle={() => setDevConsoleOpen(!devConsoleOpen)} entries={rawEntries} onClear={() => setRawEntries([])} onCopy={() => navigator.clipboard.writeText(rawEntries.map(e => `${e.type}: ${e.line}`).join('\n'))} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
