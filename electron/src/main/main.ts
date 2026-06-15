import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { compress, FFmpegOptions } from './ffmpeg';

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

// Get file path from command line arg %1 (argv[0]=electron, argv[1]=".", argv[2]=path)
ipcMain.handle('get-file-path', () => {
  return process.argv[2] || '';
});

// Start compression
ipcMain.on('start-compression', async (_e, opts: FFmpegOptions) => {
  if (!mainWindow) return;
  await compress(mainWindow, opts);
});
