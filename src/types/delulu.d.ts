declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

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

export interface SkillTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  trigger: string;
  exampleContent: string;
  constraintContent: string;
}

export interface BuilderState {
  name: string;
  description: string;
  trigger: string;
  tags: string[];
  templateId: string;
  examples: string;
  constraints: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LocalAgentInfo {
  id: string;
  name: string;
  type: 'claude' | 'gemini' | 'ollama' | 'cursor' | 'openai';
  detected: boolean;
  source: string;
  details?: string;
  hasSession: boolean;
  models: string[];
  mcpServers?: string[];
  defaultModel?: string;
  apiKey?: string;
}

export interface SymlinkTarget {
  id: 'cursor' | 'agents' | 'claude' | 'gemini' | 'workspace';
  name: string;
  targetDir: string;
  isLinked: boolean;
  available: boolean;
}

export interface ExecutionLog {
  id: string;
  timestamp: number;
  skillName: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  durationMs: number;
  status: 'success' | 'error';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  activeProvider: 'claude' | 'gemini' | 'ollama' | 'openai';
  useLocalSession: boolean;
  claudeApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  defaultModel: string;
  fontSize: number;
  fontLigatures: boolean;
}

export interface EvalRunParams {
  provider?: 'claude' | 'gemini' | 'ollama' | 'openai';
  skillContent: string;
  userInput: string;
  apiKey?: string;
  model?: string;
  useLocalSession?: boolean;
}

declare global {
  interface Window {
    deluluAPI: {
      readFile(path: string): Promise<string>;
      writeFile(path: string, content: string): Promise<void>;
      createFile(dir: string, name: string, content: string): Promise<string>;
      deleteFile(path: string): Promise<void>;
      fileExists(path: string): Promise<boolean>;
      readDirTree(path: string): Promise<FileTreeNode | null>;

      scanSkills(workspaceFolder?: string): Promise<SkillFile[]>;
      detectAgents(): Promise<LocalAgentInfo[]>;

      getVaultDir(): Promise<string>;
      getSymlinkTargets(skillName: string, workspaceFolder?: string): Promise<SymlinkTarget[]>;
      importSkillToVault(
        fileName: string,
        content: string,
        targets: string[],
        workspaceFolder?: string
      ): Promise<{ vaultPath: string; linkedTo: string[] }>;
      toggleSymlink(
        skillName: string,
        targetId: string,
        enable: boolean,
        workspaceFolder?: string
      ): Promise<boolean>;

      getRecents(): Promise<RecentSkill[]>;
      addRecent(path: string, name: string): Promise<void>;

      openFolder(): Promise<string | null>;
      getWorkspace(): Promise<string | null>;
      setWorkspace(folder: string): Promise<boolean>;

      getSetting(key: string): Promise<unknown>;
      setSetting(key: string, value: unknown): Promise<void>;

      runEval(
        paramsOrSkillContent: string | EvalRunParams,
        userInput?: string,
        apiKey?: string,
        model?: string
      ): Promise<string>;

      platform: string;
      isDev: boolean;
    };
  }
}
