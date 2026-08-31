import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { registerFileHandlers } from './skillFileSystem';
import { registerScannerHandlers } from './skillScanner';
import { registerEvalHandlers } from './evalHandler';
import { registerAgentDetectorHandlers } from './agentDetector';
import { registerVaultHandlers } from './skillVault';

// electron-store is CJS; use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Store = require('electron-store');
const store = new Store({ name: 'delulu-settings' });

const isDev = process.env.NODE_ENV === 'development';
let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    // macOS: hide titlebar, show traffic lights at custom position
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 13 },
    backgroundColor: '#0f0e14',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win!.show();
    if (isDev) win!.webContents.openDevTools({ mode: 'detach' });
  });

  win.on('closed', () => { win = null; });

  // External links → browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // ── Register all IPC handlers ────────────────────────────────────────────
  registerFileHandlers(ipcMain);
  registerScannerHandlers(ipcMain);
  registerEvalHandlers(ipcMain);
  registerAgentDetectorHandlers(ipcMain);
  registerVaultHandlers(ipcMain);

  // ── Dialog ───────────────────────────────────────────────────────────────
  ipcMain.handle('dialog:openFolder', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Open Skill Workspace — Delulu',
    });
    return filePaths[0] ?? null;
  });

  // ── Workspace ────────────────────────────────────────────────────────────
  ipcMain.handle('workspace:get', () => store.get('workspaceFolder', null));
  ipcMain.handle('workspace:set', (_e, folder: string) => {
    store.set('workspaceFolder', folder);
    return true;
  });

  // ── Settings ─────────────────────────────────────────────────────────────
  ipcMain.handle('settings:get', (_e, key: string) => store.get(key));
  ipcMain.handle('settings:set', (_e, key: string, value: unknown) => {
    store.set(key, value);
  });

  // macOS: re-create window on dock click
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
