const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // File
  getFilePath: () => ipcRenderer.invoke('get-file-path'),
  getFiles: () => ipcRenderer.invoke('get-files'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

  // FFmpeg — single file
  startCompression: (options: unknown) => ipcRenderer.send('start-compression', options),
  onProgress: (callback: (data: unknown) => void) => {
    ipcRenderer.on('compression-progress', (_e: unknown, data: unknown) => callback(data));
  },
  onDone: (callback: (data: unknown) => void) => {
    ipcRenderer.on('compression-done', (_e: unknown, data: unknown) => callback(data));
  },
  onError: (callback: (data: unknown) => void) => {
    ipcRenderer.on('compression-error', (_e: unknown, data: unknown) => callback(data));
  },
  onLog: (callback: (data: unknown) => void) => {
    ipcRenderer.on('compression-log', (_e: unknown, data: unknown) => callback(data));
  },
  onRaw: (callback: (data: unknown) => void) => {
    ipcRenderer.on('ffmpeg-raw', (_e: unknown, data: unknown) => callback(data));
  },

  // FFmpeg — batch
  startBatchCompression: (files: unknown, options: unknown) => ipcRenderer.send('start-batch-compression', files, options),
  onBatchFileStart: (callback: (data: unknown) => void) => {
    ipcRenderer.on('batch-file-start', (_e: unknown, data: unknown) => callback(data));
  },
  onBatchFileComplete: (callback: (data: unknown) => void) => {
    ipcRenderer.on('batch-file-complete', (_e: unknown, data: unknown) => callback(data));
  },
  onBatchDone: (callback: (data: unknown) => void) => {
    ipcRenderer.on('batch-done', (_e: unknown, data: unknown) => callback(data));
  },

  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('compression-progress');
    ipcRenderer.removeAllListeners('compression-done');
    ipcRenderer.removeAllListeners('compression-error');
    ipcRenderer.removeAllListeners('compression-log');
    ipcRenderer.removeAllListeners('ffmpeg-raw');
    ipcRenderer.removeAllListeners('batch-file-start');
    ipcRenderer.removeAllListeners('batch-file-complete');
    ipcRenderer.removeAllListeners('batch-done');
  },
});

export {};
