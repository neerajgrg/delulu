// Shared types for Electron main process ↔ renderer

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  extension?: string;
  isSkillDoc?: boolean;
}

export interface SkillFile {
  path: string;
  name: string;
  description?: string;
  tags?: string[];
  trigger?: string;
  source: 'cursor' | 'agents' | 'workspace' | 'custom' | 'plugin';
  pluginName?: string;
  folderPath?: string;
  isFolder?: boolean;
  tree?: FileTreeNode;
  quality: number;
  mtime: number;
}

export interface RecentSkill {
  path: string;
  name: string;
  openedAt: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  claudeApiKey?: string;
  defaultModel: string;
  workspaceFolder?: string;
  fontSize: number;
  fontLigatures: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultModel: 'claude-3-5-sonnet-20241022',
  fontSize: 13,
  fontLigatures: true,
};
