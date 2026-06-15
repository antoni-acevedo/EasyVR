const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // File
  getFilePath: () => ipcRenderer.invoke('get-file-path'),

  // FFmpeg
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
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('compression-progress');
    ipcRenderer.removeAllListeners('compression-done');
    ipcRenderer.removeAllListeners('compression-error');
    ipcRenderer.removeAllListeners('compression-log');
    ipcRenderer.removeAllListeners('ffmpeg-raw');
  },
});

export {};
