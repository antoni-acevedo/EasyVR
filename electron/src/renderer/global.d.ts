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

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getFilePath: () => Promise<string>;
  startCompression: (options: any) => void;
  onProgress: (callback: (data: ProgressData) => void) => void;
  onDone: (callback: (data: DoneData) => void) => void;
  onError: (callback: (data: string) => void) => void;
  onLog: (callback: (data: string) => void) => void;
  onRaw: (callback: (data: RawData) => void) => void;
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
