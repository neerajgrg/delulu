import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('deluluAPI', {
  // ── Files ────────────────────────────────────────────────────────────────
  readFile:    (p: string)                          => ipcRenderer.invoke('file:read', p),
  writeFile:   (p: string, content: string)         => ipcRenderer.invoke('file:write', p, content),
  createFile:  (dir: string, name: string, content: string) => ipcRenderer.invoke('file:create', dir, name, content),
  deleteFile:  (p: string)                          => ipcRenderer.invoke('file:delete', p),
  fileExists:  (p: string)                          => ipcRenderer.invoke('file:exists', p),
  readDirTree: (p: string)                          => ipcRenderer.invoke('file:readDirTree', p),

  // ── Discovery ────────────────────────────────────────────────────────────
  scanSkills:  (workspaceFolder?: string)           => ipcRenderer.invoke('scanner:scanAll', workspaceFolder),

  // ── Recents ──────────────────────────────────────────────────────────────
  getRecents:  ()                                   => ipcRenderer.invoke('recents:get'),
  addRecent:   (p: string, name: string)            => ipcRenderer.invoke('recents:add', p, name),

  // ── Workspace ────────────────────────────────────────────────────────────
  openFolder:  ()                                   => ipcRenderer.invoke('dialog:openFolder'),
  getWorkspace: ()                                  => ipcRenderer.invoke('workspace:get'),
  setWorkspace: (folder: string)                    => ipcRenderer.invoke('workspace:set', folder),

  // ── Settings (electron-store) ─────────────────────────────────────────────
  getSetting:  (key: string)                        => ipcRenderer.invoke('settings:get', key),
  setSetting:  (key: string, value: unknown)        => ipcRenderer.invoke('settings:set', key, value),

  // ── Agent Detection ──────────────────────────────────────────────────────
  detectAgents: () => ipcRenderer.invoke('agents:detect'),

  // ── Evals (Claude / Gemini / Ollama / Local Sessions) ────────────────────
  runEval: (
    paramsOrSkillContent: string | {
      provider?: string;
      skillContent: string;
      userInput: string;
      apiKey?: string;
      model?: string;
      useLocalSession?: boolean;
    },
    userInput?: string,
    apiKey?: string,
    model?: string
  ) =>
    ipcRenderer.invoke('eval:run', paramsOrSkillContent, userInput, apiKey, model),

  // ── Central Vault & Symlink Manager ──────────────────────────────────────
  getVaultDir: () => ipcRenderer.invoke('vault:getDir'),
  getSymlinkTargets: (skillName: string, workspaceFolder?: string) =>
    ipcRenderer.invoke('vault:getTargets', skillName, workspaceFolder),
  importSkillToVault: (fileName: string, content: string, targets: string[], workspaceFolder?: string) =>
    ipcRenderer.invoke('vault:import', fileName, content, targets, workspaceFolder),
  toggleSymlink: (skillName: string, targetId: string, enable: boolean, workspaceFolder?: string) =>
    ipcRenderer.invoke('vault:toggleSymlink', skillName, targetId, enable, workspaceFolder),

  // ── Meta ─────────────────────────────────────────────────────────────────
  platform: process.platform,
  isDev:    process.env.NODE_ENV === 'development',
});
