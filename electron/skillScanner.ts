import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { IpcMain } from 'electron';
import type { SkillFile, RecentSkill } from './types';

// ── Pattern matching for skill files ─────────────────────────────────────────
const SKILL_PATTERN = /^(SKILL|skill|Skill)\.md$|\.skill\.md$/i;

// ── Known discovery directories ───────────────────────────────────────────────
function getKnownDirs(): Array<{ dir: string; source: SkillFile['source'] }> {
  const home = os.homedir();
  return [
    { dir: path.join(home, '.delulu', 'skills'), source: 'custom' },
    { dir: path.join(home, '.cursor', 'skills'), source: 'cursor' },
    { dir: path.join(home, '.cursor', 'rules'), source: 'cursor' },
    { dir: path.join(home, '.agents', 'skills'), source: 'agents' },
    { dir: path.join(home, '.agents'), source: 'agents' },
    { dir: path.join(home, '.claude', 'skills'), source: 'agents' },
    { dir: path.join(home, '.gemini', 'skills'), source: 'agents' },
    { dir: path.join(home, '.config', 'skills'), source: 'agents' },
  ];
}

// ── Known Plugin root directories ────────────────────────────────────────────
function getKnownPluginRoots(): Array<{ rootDir: string; defaultPluginName?: string }> {
  const home = os.homedir();
  return [
    { rootDir: path.join(home, '.gemini', 'config', 'plugins') },
    { rootDir: path.join(home, '.gemini', 'antigravity', 'builtin', 'skills'), defaultPluginName: 'antigravity-builtin' },
    { rootDir: path.join(home, '.claude', 'plugins') },
    { rootDir: path.join(home, '.cursor', 'extensions') },
  ];
}

// ── Frontmatter parser ───────────────────────────────────────────────────────
function parseFm(content: string): Record<string, unknown> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out: Record<string, unknown> = {};
  for (const line of m[1].split('\n')) {
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const raw = line.slice(ci + 1).trim();
    if (raw.startsWith('[')) {
      out[key] = raw
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      out[key] = raw.replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

// ── Quality scorer ────────────────────────────────────────────────────────────
function score(content: string, fm: Record<string, unknown>): number {
  let s = 0;
  if (fm['name']) s++;
  if (String(fm['description'] ?? '').length > 20) s++;
  if (fm['trigger']) s++;
  if ((fm['tags'] as string[] | undefined)?.length) s++;
  if (content.includes('## Examples') && content.includes('## Constraints')) s++;
  return s;
}

import { readDirTree } from './skillFileSystem';

// ── Read one skill file ───────────────────────────────────────────────────────
function readSkill(
  filePath: string,
  source: SkillFile['source'],
  pluginName?: string
): SkillFile | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fm = parseFm(content);
    const stat = fs.statSync(filePath);
    const dirPath = path.dirname(filePath);
    const dirBase = path.basename(dirPath);
    const fileName = path.basename(filePath);
    const fileBase = fileName.replace(/\.(skill\.)?md$/i, '');
    const isSkillMdInFolder = /^(SKILL|skill|Skill)\.md$/i.test(fileName);
    const resolvedName =
      String(fm['name'] ?? (isSkillMdInFolder ? dirBase : fileBase));

    const isFolder = isSkillMdInFolder;
    const folderPath = isFolder ? dirPath : undefined;
    const tree = isFolder ? readDirTree(dirPath) || undefined : undefined;

    return {
      path: filePath,
      name: resolvedName,
      description: fm['description'] ? String(fm['description']) : undefined,
      tags: (fm['tags'] as string[] | undefined) ?? [],
      trigger: fm['trigger'] ? String(fm['trigger']) : undefined,
      source,
      pluginName,
      folderPath,
      isFolder,
      tree,
      quality: score(content, fm),
      mtime: stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

// ── Recursive directory scan ──────────────────────────────────────────────────
function scanDir(
  dir: string,
  source: SkillFile['source'],
  depth = 0,
  pluginName?: string
): SkillFile[] {
  if (!fs.existsSync(dir) || depth > 4) return [];
  const results: SkillFile[] = [];
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && depth < 4) {
        results.push(...scanDir(path.join(dir, e.name), source, depth + 1, pluginName));
      } else if (e.isFile() && SKILL_PATTERN.test(e.name)) {
        const s = readSkill(path.join(dir, e.name), source, pluginName);
        if (s) results.push(s);
      }
    }
  } catch {
    // permission error — skip
  }
  return results;
}

// ── Scan Plugin Root Directories ─────────────────────────────────────────────
function scanPlugins(): SkillFile[] {
  const skills: SkillFile[] = [];
  for (const { rootDir, defaultPluginName } of getKnownPluginRoots()) {
    if (!fs.existsSync(rootDir)) continue;
    try {
      if (defaultPluginName) {
        // Flat plugin skills directory
        skills.push(...scanDir(rootDir, 'plugin', 0, defaultPluginName));
      } else {
        // Multi-plugin root directory (each subdirectory is a plugin)
        for (const item of fs.readdirSync(rootDir, { withFileTypes: true })) {
          if (item.isDirectory()) {
            const pluginDir = path.join(rootDir, item.name);
            const pName = item.name;
            skills.push(...scanDir(pluginDir, 'plugin', 0, pName));
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return skills;
}

// ── Full scan ─────────────────────────────────────────────────────────────────
export function scanAll(workspaceFolder?: string): SkillFile[] {
  const seen = new Set<string>();
  const skills: SkillFile[] = [];
  const add = (list: SkillFile[]) => {
    for (const s of list) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        skills.push(s);
      }
    }
  };

  // 1. Known standalone skill directories
  for (const { dir, source } of getKnownDirs()) {
    add(scanDir(dir, source));
  }

  // 2. Plugin & Extension bundles
  add(scanPlugins());

  // 3. Workspace skills & workspace plugins
  if (workspaceFolder) {
    add(scanDir(workspaceFolder, 'workspace'));
    const wsPlugins = path.join(workspaceFolder, 'plugins');
    if (fs.existsSync(wsPlugins)) {
      add(scanDir(wsPlugins, 'plugin', 0, 'workspace-plugin'));
    }
  }

  return skills;
}

// ── Recents ───────────────────────────────────────────────────────────────────
const RECENTS_PATH = path.join(os.homedir(), '.delulu', 'recents.json');
const MAX_RECENTS = 8;

function loadRecents(): RecentSkill[] {
  try {
    return JSON.parse(fs.readFileSync(RECENTS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveRecent(filePath: string, name: string): void {
  let list = loadRecents().filter((r) => r.path !== filePath);
  list.unshift({ path: filePath, name, openedAt: Date.now() });
  if (list.length > MAX_RECENTS) list = list.slice(0, MAX_RECENTS);
  fs.mkdirSync(path.dirname(RECENTS_PATH), { recursive: true });
  fs.writeFileSync(RECENTS_PATH, JSON.stringify(list, null, 2));
}

// ── IPC Registration ──────────────────────────────────────────────────────────
export function registerScannerHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('scanner:scanAll', (_e, workspaceFolder?: string) =>
    scanAll(workspaceFolder)
  );
  ipcMain.handle('recents:get', () => loadRecents());
  ipcMain.handle('recents:add', (_e, filePath: string, name: string) =>
    saveRecent(filePath, name)
  );
}
