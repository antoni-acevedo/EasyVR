import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { cpus } from 'os';

let ffmpegPath = 'ffmpeg';
let ffprobePath = 'ffprobe';

function findFFmpeg(): void {
  const candidates = [
    process.env.FFMPEG_PATH || '',
    path.join(process.resourcesPath || '', 'ffmpeg', 'ffmpeg.exe'),
    path.join(__dirname, '..', '..', '..', 'ffmpeg', 'ffmpeg.exe'),
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      ffmpegPath = c;
      break;
    }
  }

  const probeCandidates = [
    process.env.FFPROBE_PATH || '',
    path.join(process.resourcesPath || '', 'ffmpeg', 'ffprobe.exe'),
    path.join(__dirname, '..', '..', '..', 'ffmpeg', 'ffprobe.exe'),
  ];

  for (const c of probeCandidates) {
    if (c && fs.existsSync(c)) {
      ffprobePath = c;
      break;
    }
  }
}

export interface FFmpegOptions {
  filePath: string;
  mode: 'fixed' | 'percent' | 'crf';
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

export interface ProgressData {
  frame: number;
  totalFrames: number;
  percent: number;
  fps: number;
  time: string;
  bitrate: string;
  pass: number;
}

export interface DoneData {
  success: boolean;
  exitCode: number;
  outputPath: string;
  originalSize: number;
  finalSize: number;
  error?: string;
}

function sendProgress(win: BrowserWindow, data: ProgressData): void {
  if (!win.isDestroyed()) win.webContents.send('compression-progress', data);
}
function sendLog(win: BrowserWindow, msg: string): void {
  if (!win.isDestroyed()) win.webContents.send('compression-log', msg);
}
function sendDone(win: BrowserWindow, data: DoneData): void {
  if (!win.isDestroyed()) win.webContents.send('compression-done', data);
}
function sendError(win: BrowserWindow, msg: string): void {
  if (!win.isDestroyed()) win.webContents.send('compression-error', msg);
}
function sendRaw(win: BrowserWindow, type: string, line: string): void {
  if (!win.isDestroyed()) win.webContents.send('ffmpeg-raw', { type, line });
}

function buildArgs(opts: FFmpegOptions, bitrateK: number, outputPath: string): string[] {
  const args: string[] = ['-y', '-f', 'mp4', '-i', opts.filePath];

  if (opts.resolution !== 'orig') {
    const scaleMap: Record<string, string> = {
      '4k': '3840:2160', '1440p': '2560:1440', '1080p': '1920:1080',
      '720p': '1280:720', '480p': '854:480', '360p': '640:360',
    };
    const s = scaleMap[opts.resolution] || '1920:1080';
    args.push('-vf', `scale=min(${s},iw):min(${s},ih):force_original_aspect_ratio=decrease`);
  }

  if (opts.fps !== 'orig') args.push('-r', opts.fps);

  args.push('-c:v', opts.codec === 'h265' ? 'libx265' : 'libx264');
  args.push('-preset', opts.preset);

  if (opts.mode === 'crf') {
    args.push('-crf', String(opts.crf || 23));
  } else {
    args.push('-b:v', `${bitrateK}k`);
  }

  args.push('-movflags', '+faststart');
  args.push('-progress', 'pipe:1');

  if (opts.audio === 'keep') args.push('-c:a', 'copy');
  else if (opts.audio === 'reencode') args.push('-c:a', 'aac', '-b:a', '128k');
  else args.push('-an');

  args.push(outputPath);
  return args;
}

function getDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffprobePath, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      '-f', 'mp4',
      filePath,
    ]);
    let out = '';
    let errOut = '';
    proc.stdout.on('data', (d: Buffer) => (out += d.toString()));
    proc.stderr.on('data', (d: Buffer) => (errOut += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve(parseFloat(out.trim()) || 0);
      else reject(new Error(`ffprobe duration exit: ${code}, stderr: ${errOut.slice(-200)}`));
    });
    proc.on('error', reject);
  });
}

function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

async function getVideoInfo(filePath: string): Promise<{ width: number; height: number; fps: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffprobePath, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate',
      '-of', 'csv=p=0',
      '-f', 'mp4',
      filePath,
    ]);
    let out = '';
    let errOut = '';
    proc.stdout.on('data', (d: Buffer) => (out += d.toString()));
    proc.stderr.on('data', (d: Buffer) => (errOut += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) {
        const parts = out.trim().split(',');
        const w = parseInt(parts[0]) || 0;
        const h = parseInt(parts[1]) || 0;
        const fpsParts = (parts[2] || '0/1').split('/');
        const fps = Math.round(parseFloat(fpsParts[0]) / parseFloat(fpsParts[1]));
        resolve({ width: w, height: h, fps });
      } else reject(new Error(`ffprobe video info exit: ${code}, stderr: ${errOut.slice(-200)}`));
    });
    proc.on('error', reject);
  });
}

function runFFmpegProcess(
  win: BrowserWindow,
  opts: FFmpegOptions,
  outputPath: string,
  actualFps: number,
): Promise<{ exitCode: number; outputPath: string }> {
  return new Promise(async (resolve) => {
    const duration = await getDuration(opts.filePath);
    if (duration <= 0) {
      sendError(win, 'Could not read video duration. File may be corrupted.');
      resolve({ exitCode: -1, outputPath: '' });
      return;
    }
    const origSize = getFileSize(opts.filePath);
    const outNameBase = path.basename(opts.filePath, path.extname(opts.filePath));
    let currentBitrate = 0;

    // Calculate audio bitrate based on user selection
    let audioBitrate = 128;
    if (opts.audio === 'remove') audioBitrate = 0;
    else if (opts.audio === 'keep') audioBitrate = 128; // conservative estimate for copy

    // Calculate initial bitrate
    if (opts.mode === 'fixed') {
      const totalBitrate = Math.round((opts.targetSize! * 8192) / duration);
      currentBitrate = totalBitrate - audioBitrate;
      if (currentBitrate < 100) {
        sendError(win, `Size too small for video duration (${duration.toFixed(1)}s)`);
        resolve({ exitCode: -1, outputPath: '' });
        return;
      }
    } else if (opts.mode === 'percent') {
      const targetSize = origSize * (opts.percent! / 100);
      const totalBitrate = Math.round((targetSize / (1024 * 1024) * 8192) / duration);
      currentBitrate = Math.max(100, totalBitrate - audioBitrate);
    }

    const maxPasses = opts.mode === 'fixed' ? opts.maxPasses : 1;
    let outputFile = outputPath;
    let tempFile = '';

    for (let pass = 1; pass <= maxPasses; pass++) {
      const isLastPass = (pass === maxPasses);
      const passOutput = (isLastPass || opts.mode !== 'fixed')
        ? outputFile
        : outputFile.replace(/\.\w+$/, '_temp.$&');

      const args = buildArgs(opts, currentBitrate, passOutput);

      sendLog(win, `Pass ${pass}/${maxPasses} - ${opts.mode === 'crf' ? `CRF ${opts.crf}` : `${currentBitrate}k`}`);

      const outFps = opts.fps !== 'orig' ? parseInt(opts.fps) : actualFps;
      const totalFrames = Math.round(duration * outFps);
      sendLog(win, `Frames: ${totalFrames} (FPS: ${outFps})`);

      // Send command before execution
      const cmdStr = `${ffmpegPath} ${args.join(' ')}`;
      sendRaw(win, 'cmd', cmdStr);

      const result = await runOnePass(win, args, pass, totalFrames);

      if (result.exitCode !== 0) {
        resolve({ exitCode: result.exitCode, outputPath: '' });
        return;
      }

      if (opts.mode === 'fixed' && !isLastPass) {
        const actualSize = getFileSize(passOutput);
        const actualMb = actualSize / (1024 * 1024);
        const ratio = opts.targetSize! / actualMb;

        sendLog(win, `Pass ${pass} result: ${actualMb.toFixed(2)} MB (target: ${opts.targetSize} MB, ratio: ${ratio.toFixed(2)})`);

        if (ratio >= 0.90 && ratio <= 1.10) {
          if (passOutput !== outputFile) {
            try { fs.copyFileSync(passOutput, outputFile); } catch { }
            try { fs.unlinkSync(passOutput); } catch { }
          }
          resolve({ exitCode: 0, outputPath: outputFile });
          return;
        }

        currentBitrate = Math.max(100, Math.round(currentBitrate * ratio));
        sendLog(win, `Adjusting bitrate to ${currentBitrate}k for pass ${pass + 1}`);
      } else if (opts.mode === 'percent' && pass === 1) {
        const actualSize = getFileSize(passOutput);
        const actualMb = actualSize / (1024 * 1024);
        const targetSize = origSize * (opts.percent! / 100) / (1024 * 1024);
        const ratio = targetSize / actualMb;

        if (ratio < 0.85 || ratio > 1.15) {
          currentBitrate = Math.max(100, Math.round(currentBitrate * ratio));
          sendLog(win, `Adjusting bitrate to ${currentBitrate}k`);

          const tempOut = outputFile.replace(/\.\w+$/, '_temp.$&');
          const adjArgs = buildArgs(opts, currentBitrate, tempOut);
          const adjResult = await runOnePass(win, adjArgs, 2, totalFrames);

          if (adjResult.exitCode === 0) {
            try { fs.copyFileSync(tempOut, outputFile); } catch { }
            try { fs.unlinkSync(tempOut); } catch { }
          } else {
            try { fs.unlinkSync(tempOut); } catch { }
            sendError(win, `Adjustment pass failed (exit: ${adjResult.exitCode})`);
            resolve({ exitCode: adjResult.exitCode, outputPath: '' });
            return;
          }
        }
      }

      if (passOutput !== outputFile) {
        try { fs.copyFileSync(passOutput, outputFile); } catch { }
        try { fs.unlinkSync(passOutput); } catch { }
      }
    }

    resolve({ exitCode: 0, outputPath: outputFile });
  });
}

function runOnePass(
  win: BrowserWindow,
  args: string[],
  pass: number,
  totalFrames: number,
): Promise<{ exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let lastFrame = 0;

    proc.stdout.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        sendRaw(win, 'stdout', trimmed);

        if (trimmed.startsWith('frame=')) {
          lastFrame = parseInt(trimmed.split('=')[1]) || 0;
        }

        if (trimmed.startsWith('progress=') && lastFrame > 0) {
          const pct = Math.min(99, Math.round((lastFrame / Math.max(1, totalFrames)) * 100));
          sendProgress(win, {
            frame: lastFrame,
            totalFrames,
            percent: pct,
            fps: 0,
            time: '',
            bitrate: '',
            pass,
          });
          lastFrame = 0;
        }
      }
    });

    let stderr = '';
    proc.stderr.on('data', (chunk: Buffer) => {
      const txt = chunk.toString();
      stderr += txt;
      const lines = txt.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) sendRaw(win, 'stderr', trimmed);
      }
    });

    proc.on('close', (exitCode) => {
      if (exitCode !== 0) {
        sendLog(win, stderr.split('\n').slice(-5).join('\n'));
      }
      resolve({ exitCode: exitCode ?? -1 });
    });

    proc.on('error', (err) => {
      sendError(win, `Failed to start FFmpeg: ${err.message}`);
      resolve({ exitCode: -1 });
    });
  });
}

export async function compress(
  win: BrowserWindow,
  opts: FFmpegOptions,
): Promise<void> {
  findFFmpeg();

  // Validate file path exists
  if (!fs.existsSync(opts.filePath)) {
    sendError(win, `File not found: ${opts.filePath}`);
    return;
  }

  try {
    const info = await getVideoInfo(opts.filePath);
    const origSize = getFileSize(opts.filePath);
    const origMb = (origSize / (1024 * 1024)).toFixed(1);
    sendLog(win, `File: ${path.basename(opts.filePath)} (${origMb} MB)`);
    sendLog(win, `Video: ${info.width}x${info.height} @ ${info.fps} fps`);

    const ext = `.${opts.format}`;
    const outNameBase = path.basename(opts.filePath, path.extname(opts.filePath));
    const outputPath = path.join(path.dirname(opts.filePath), `${outNameBase}_compressed${ext}`);

    const result = await runFFmpegProcess(win, opts, outputPath, info.fps);

    if (result.exitCode !== 0) {
      sendError(win, `FFmpeg exit code: ${result.exitCode}`);
      return;
    }

    const finalSize = getFileSize(result.outputPath);
    const saved = ((origSize - finalSize) / (1024 * 1024)).toFixed(1);
    const finalMb = (finalSize / (1024 * 1024)).toFixed(1);

    sendDone(win, {
      success: true,
      exitCode: 0,
      outputPath: result.outputPath,
      originalSize: origSize,
      finalSize,
    });
    sendLog(win, `Done! ${origMb} MB → ${finalMb} MB (saved ${saved} MB)`);
  } catch (err: any) {
    sendError(win, err.message || String(err));
  }
}
