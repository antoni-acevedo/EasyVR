import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { compress, compressBatch, FFmpegOptions } from './ffmpeg';

let mainWindow: BrowserWindow | null = null;

const isDev = !fs.existsSync(path.join(__dirname, '../renderer/index.html'));

if (!app.requestSingleInstanceLock()) {
  process.exit(0);
}

let pendingFiles: string[] = [];

app.on('second-instance', (_event, commandLine) => {
  const files = commandLine.slice(2).filter(f => f !== '.');
  if (files.length > 0) {
    console.log('EasyVR second-instance files:', files);
    pendingFiles.push(...files);
    if (mainWindow) {
      mainWindow.webContents.send('new-files', files);
      mainWindow.show();
      mainWindow.focus();
    }
  }
});

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

function getVideoFiles(): string[] {
  return process.argv.slice(2);
}

// Get file path from command line arg %1 (argv[0]=electron, argv[1]=".", argv[2]=path)
ipcMain.handle('get-file-path', () => {
  const fp = process.argv[2] || '';
  console.log('EasyVR argv:', process.argv.slice(2));
  return fp;
});

// Get all video files from command line + pending secondary instances
ipcMain.handle('get-files', () => {
  const initialFiles = getVideoFiles().filter(f => f !== '.');
  const allFiles = [...initialFiles, ...pendingFiles];
  pendingFiles = [];
  console.log('EasyVR files:', allFiles);
  return allFiles;
});

// Debug: return raw process.argv for troubleshooting
ipcMain.handle('get-raw-argv', () => {
  return process.argv;
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
