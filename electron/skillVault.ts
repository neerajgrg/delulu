import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { IpcMain } from 'electron';
import type { SkillFile } from './types';

export interface SymlinkTarget {
  id: 'cursor' | 'agents' | 'claude' | 'gemini' | 'workspace';
  name: string;
  targetDir: string;
  isLinked: boolean;
  available: boolean;
}

export interface SkillVaultInfo {
  vaultDir: string;
  skills: SkillFile[];
}

/**
 * Returns the path to the central Delulu Skill Vault.
 * Default: ~/.delulu/skills/
 */
export function getDeluluVaultDir(): string {
  const home = os.homedir();
  const vaultDir = path.join(home, '.delulu', 'skills');
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }
  return vaultDir;
}

/**
 * Returns the standard directories for respective AI agents on the system.
 */
export function getAgentDirectories(workspaceFolder?: string): Record<string, string> {
  const home = os.homedir();
  return {
    cursor: path.join(home, '.cursor', 'skills'),
    agents: path.join(home, '.agents', 'skills'),
    claude: path.join(home, '.claude', 'skills'),
    gemini: path.join(home, '.gemini', 'skills'),
    workspace: workspaceFolder ? path.join(workspaceFolder, 'skills') : path.join(home, 'delulu-workspace', 'skills'),
  };
}

/**
 * Checks which agent folders currently have symlinks or copies of this skill.
 */
export function getSkillSymlinkTargets(skillFileName: string, workspaceFolder?: string): SymlinkTarget[] {
  const agentDirs = getAgentDirectories(workspaceFolder);
  const vaultDir = getDeluluVaultDir();
  const sourcePath = path.join(vaultDir, skillFileName);

  const targets: SymlinkTarget[] = [
    {
      id: 'cursor',
      name: 'Cursor IDE (.cursor/skills)',
      targetDir: agentDirs.cursor,
      isLinked: false,
      available: true,
    },
    {
      id: 'agents',
      name: 'Local Agents (.agents/skills)',
      targetDir: agentDirs.agents,
      isLinked: false,
      available: true,
    },
    {
      id: 'claude',
      name: 'Claude Code (.claude/skills)',
      targetDir: agentDirs.claude,
      isLinked: false,
      available: true,
    },
    {
      id: 'gemini',
      name: 'Google Gemini & Antigravity (.gemini/skills)',
      targetDir: agentDirs.gemini,
      isLinked: false,
      available: true,
    },
    {
      id: 'workspace',
      name: 'Active Project Workspace (workspace/skills)',
      targetDir: agentDirs.workspace,
      isLinked: false,
      available: !!workspaceFolder,
    },
  ];

  targets.forEach((t) => {
    const destPath = path.join(t.targetDir, skillFileName);
    try {
      if (fs.existsSync(destPath)) {
        const stat = fs.lstatSync(destPath);
        if (stat.isSymbolicLink()) {
          const pointsTo = fs.readlinkSync(destPath);
          t.isLinked = pointsTo === sourcePath || path.resolve(t.targetDir, pointsTo) === sourcePath;
        } else {
          t.isLinked = true; // file exists directly
        }
      }
    } catch {
      t.isLinked = false;
    }
  });

  return targets;
}

/**
 * Imports a skill into the central Delulu Vault and creates symlinks in selected agent directories.
 */
export function importSkillToVault(
  fileName: string,
  content: string,
  syncTargets: string[] = ['cursor', 'agents', 'workspace'],
  workspaceFolder?: string
): { vaultPath: string; linkedTo: string[] } {
  const vaultDir = getDeluluVaultDir();
  const cleanName = fileName.endsWith('.skill.md') ? fileName : `${fileName.replace(/\.md$/, '')}.skill.md`;
  const vaultPath = path.join(vaultDir, cleanName);

  // 1. Save master copy to Delulu Vault
  fs.writeFileSync(vaultPath, content, 'utf8');

  // 2. Manage symlinks
  const agentDirs = getAgentDirectories(workspaceFolder);
  const linkedTo: string[] = [];

  for (const [agentId, targetDir] of Object.entries(agentDirs)) {
    const destPath = path.join(targetDir, cleanName);
    const shouldLink = syncTargets.includes(agentId);

    try {
      if (shouldLink) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        if (fs.existsSync(destPath) || fs.lstatSync(destPath).isSymbolicLink()) {
          fs.unlinkSync(destPath);
        }
        fs.symlinkSync(vaultPath, destPath);
        linkedTo.push(agentId);
      } else {
        if (fs.existsSync(destPath)) {
          const stat = fs.lstatSync(destPath);
          if (stat.isSymbolicLink()) {
            fs.unlinkSync(destPath);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return { vaultPath, linkedTo };
}

/**
 * Toggles a symlink for a skill in a specific agent directory.
 */
export function toggleSkillSymlink(
  skillFileName: string,
  targetId: string,
  enable: boolean,
  workspaceFolder?: string
): boolean {
  const vaultDir = getDeluluVaultDir();
  const sourcePath = path.join(vaultDir, skillFileName);
  const agentDirs = getAgentDirectories(workspaceFolder);
  const targetDir = agentDirs[targetId];

  if (!targetDir || !fs.existsSync(sourcePath)) return false;

  const destPath = path.join(targetDir, skillFileName);

  try {
    if (enable) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      if (fs.existsSync(destPath) || (fs.existsSync(targetDir) && fs.lstatSync(destPath).isSymbolicLink())) {
        fs.unlinkSync(destPath);
      }
      fs.symlinkSync(sourcePath, destPath);
      return true;
    } else {
      if (fs.existsSync(destPath) || (fs.existsSync(targetDir) && fs.lstatSync(destPath).isSymbolicLink())) {
        fs.unlinkSync(destPath);
      }
      return true;
    }
  } catch {
    return false;
  }
}

export function registerVaultHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('vault:getDir', () => getDeluluVaultDir());
  ipcMain.handle('vault:getTargets', (_e, skillName: string, workspaceFolder?: string) =>
    getSkillSymlinkTargets(skillName, workspaceFolder)
  );
  ipcMain.handle(
    'vault:import',
    (_e, fileName: string, content: string, targets: string[], workspaceFolder?: string) =>
      importSkillToVault(fileName, content, targets, workspaceFolder)
  );
  ipcMain.handle(
    'vault:toggleSymlink',
    (_e, skillName: string, targetId: string, enable: boolean, workspaceFolder?: string) =>
      toggleSkillSymlink(skillName, targetId, enable, workspaceFolder)
  );
}
