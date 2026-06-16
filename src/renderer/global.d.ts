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

export interface RawData {
  type: 'cmd' | 'stdout' | 'stderr';
  line: string;
}

export interface BatchFileStartData {
  fileIndex: number;
  totalFiles: number;
  fileName: string;
}

export interface BatchFileCompleteData {
  fileIndex: number;
  totalFiles: number;
  fileName: string;
  success: boolean;
  originalSize: number;
  finalSize: number;
  outputPath: string;
}

export interface BatchDoneData {
  totalFiles: number;
}

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getFilePath: () => Promise<string>;
  getFiles: () => Promise<string[]>;
  openFileDialog: () => Promise<string[]>;
  startCompression: (options: any) => void;
  startBatchCompression: (files: string[], options: any) => void;
  onProgress: (callback: (data: ProgressData) => void) => void;
  onDone: (callback: (data: DoneData) => void) => void;
  onError: (callback: (data: string) => void) => void;
  onLog: (callback: (data: string) => void) => void;
  onRaw: (callback: (data: RawData) => void) => void;
  onBatchFileStart: (callback: (data: BatchFileStartData) => void) => void;
  onBatchFileComplete: (callback: (data: BatchFileCompleteData) => void) => void;
  onBatchDone: (callback: (data: BatchDoneData) => void) => void;
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.svg' {
  const value: string;
  export default value;
}
