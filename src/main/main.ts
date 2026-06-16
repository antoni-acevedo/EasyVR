import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { compress, compressBatch, FFmpegOptions } from './ffmpeg';

let mainWindow: BrowserWindow | null = null;

const isDev = !fs.existsSync(path.join(__dirname, '../renderer/index.html'));

function createWindow(): void {
    mainWindow = new BrowserWindow({
    width: 480,
    height: 360,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    icon: path.join(__dirname, '../../assets/icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window control IPC
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.m4v', '.ts', '.mts',
  '.3gp', '.webm', '.flv', '.dvr',
]);

function getVideoFiles(): string[] {
  return process.argv.slice(2).filter(a =>
    VIDEO_EXTENSIONS.has(path.extname(a).toLowerCase()),
  );
}

// Get file path from command line arg %1 (argv[0]=electron, argv[1]=".", argv[2]=path)
ipcMain.handle('get-file-path', () => {
  const fp = process.argv[2] || '';
  console.log('EasyVR argv:', process.argv.slice(2));
  return fp;
});

// Get all video files from command line (batch mode with %*)
ipcMain.handle('get-files', () => {
  const files = getVideoFiles();
  console.log('EasyVR files:', files);
  return files;
});

// Open native file dialog
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{
      name: 'Video Files',
      extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'm4v', 'ts', 'mts', '3gp', 'webm', 'flv', 'dvr'],
    }],
  });
  return result.filePaths;
});

// Start compression (single file)
ipcMain.on('start-compression', async (_e, opts: FFmpegOptions) => {
  if (!mainWindow) return;
  await compress(mainWindow, opts);
});

// Start batch compression (multiple files)
ipcMain.on('start-batch-compression', async (_e, files: string[], opts: Omit<FFmpegOptions, 'filePath'>) => {
  if (!mainWindow) return;
  await compressBatch(mainWindow, files, opts);
});
