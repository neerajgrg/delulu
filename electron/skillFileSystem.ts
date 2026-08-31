import * as fs from 'fs';
import * as path from 'path';
import type { IpcMain } from 'electron';

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  extension?: string;
  isSkillDoc?: boolean;
}

export function readDirTree(dirPath: string, depth = 0): FileTreeNode | null {
  if (!fs.existsSync(dirPath) || depth > 4) return null;
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    const ext = path.extname(dirPath).toLowerCase();
    const base = path.basename(dirPath);
    return {
      name: base,
      path: dirPath,
      type: 'file',
      extension: ext,
      isSkillDoc: /^(SKILL|skill|Skill)\.md$|\.skill\.md$/i.test(base),
    };
  }

  const children: FileTreeNode[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.') && e.name !== '.cursor' && e.name !== '.agents') continue;
      const subPath = path.join(dirPath, e.name);
      if (e.isDirectory()) {
        const subTree = readDirTree(subPath, depth + 1);
        if (subTree) children.push(subTree);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        children.push({
          name: e.name,
          path: subPath,
          type: 'file',
          extension: ext,
          isSkillDoc: /^(SKILL|skill|Skill)\.md$|\.skill\.md$/i.test(e.name),
        });
      }
    }
  } catch {
    // ignore
  }

  // Sort directories first, then files (SKILL.md at top)
  children.sort((a, b) => {
    if (a.type === b.type) {
      if (a.isSkillDoc) return -1;
      if (b.isSkillDoc) return 1;
      return a.name.localeCompare(b.name);
    }
    return a.type === 'directory' ? -1 : 1;
  });

  return {
    name: path.basename(dirPath),
    path: dirPath,
    type: 'directory',
    children,
  };
}

export function registerFileHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('file:read', (_e, p: string) =>
    fs.readFileSync(p, 'utf-8'));

  ipcMain.handle('file:write', (_e, p: string, content: string) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf-8');
  });

  ipcMain.handle('file:create', async (_e, dir: string, name: string, content: string) => {
    fs.mkdirSync(dir, { recursive: true });
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const p = path.join(dir, `${slug || 'new-skill'}.skill.md`);
    fs.writeFileSync(p, content, 'utf-8');
    return p;
  });

  ipcMain.handle('file:delete', (_e, p: string) => {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        fs.unlinkSync(p);
      }
    }
  });

  ipcMain.handle('file:exists', (_e, p: string) => fs.existsSync(p));
  ipcMain.handle('file:readDirTree', (_e, p: string) => readDirTree(p));
}
