import { create } from 'zustand';
import type {
  SkillFile,
  RecentSkill,
  AppSettings,
  BuilderState,
  LocalAgentInfo,
  ExecutionLog,
} from '../types/delulu';

export type ActivePanel = 'home' | 'explorer' | 'gallery' | 'evals' | 'agents' | 'settings';
export type MainView   = 'welcome' | 'editor' | 'builder' | 'gallery' | 'evals' | 'agents' | 'settings';
export type BottomTab  = 'problems' | 'logs' | 'repl' | 'terminal';

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface DeluluStore {
  // ── UI Layout ──────────────────────────────────────────────────────────────
  panel: ActivePanel;
  view: MainView;
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  isBottomConsoleOpen: boolean;
  bottomConsoleTab: BottomTab;
  isCommandPaletteOpen: boolean;

  setPanel: (p: ActivePanel) => void;
  setView: (v: MainView) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleBottomConsole: () => void;
  setBottomConsoleTab: (t: BottomTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // ── Workspace ───────────────────────────────────────────────────────────────
  workspaceFolder: string | null;
  setWorkspaceFolder: (f: string | null) => void;

  // ── Skills ──────────────────────────────────────────────────────────────────
  skills: SkillFile[];
  recents: RecentSkill[];
  isLoading: boolean;
  setSkills: (s: SkillFile[]) => void;
  setRecents: (r: RecentSkill[]) => void;
  refreshSkills: () => Promise<void>;
  deleteSkill: (path: string) => Promise<void>;

  // ── Local Agents & Sessions ─────────────────────────────────────────────────
  detectedAgents: LocalAgentInfo[];
  refreshAgents: () => Promise<void>;

  // ── Execution Logs & Console ────────────────────────────────────────────────
  executionLogs: ExecutionLog[];
  addExecutionLog: (log: ExecutionLog) => void;
  clearExecutionLogs: () => void;

  // ── Editor tabs ─────────────────────────────────────────────────────────────
  tabs: OpenTab[];
  activeTab: string | null;
  openSkill: (skill: SkillFile) => Promise<void>;
  openFile: (filePath: string, name?: string) => Promise<void>;
  closeTab: (path: string) => void;
  focusTab: (path: string) => void;
  updateContent: (path: string, content: string) => void;
  saveTab: (path: string) => Promise<void>;

  // ── Search / filter ─────────────────────────────────────────────────────────
  search: string;
  setSearch: (q: string) => void;

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => Promise<void>;

  // ── Builder ─────────────────────────────────────────────────────────────────
  builderPreset: Partial<BuilderState> | null;
  setBuilderPreset: (p: Partial<BuilderState> | null) => void;

  // ── Init ────────────────────────────────────────────────────────────────────
  init: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  activeProvider: 'claude',
  useLocalSession: true,
  claudeApiKey: '',
  geminiApiKey: '',
  openaiApiKey: '',
  defaultModel: 'claude-3-5-sonnet-20241022',
  fontSize: 13,
  fontLigatures: true,
};

export const useStore = create<DeluluStore>((set, get) => ({
  // ── UI Layout ──────────────────────────────────────────────────────────────
  panel: 'home',
  view: 'welcome',
  theme: 'dark',
  isSidebarOpen: true,
  isBottomConsoleOpen: false,
  bottomConsoleTab: 'problems',
  isCommandPaletteOpen: false,

  setPanel: (panel) => set({ panel, isSidebarOpen: true }),
  setView: (view) => set({ view }),
  toggleTheme: async () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({
      theme: next,
      settings: { ...get().settings, theme: next },
    });
    document.documentElement.classList.toggle('light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.setAttribute('data-theme', next);
    await window.deluluAPI.setSetting('theme', next);
  },
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleBottomConsole: () => set((s) => ({ isBottomConsoleOpen: !s.isBottomConsoleOpen })),
  setBottomConsoleTab: (bottomConsoleTab) => set({ bottomConsoleTab, isBottomConsoleOpen: true }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  // ── Workspace ───────────────────────────────────────────────────────────────
  workspaceFolder: null,
  setWorkspaceFolder: async (folder) => {
    set({ workspaceFolder: folder });
    if (folder) {
      await window.deluluAPI.setWorkspace(folder);
      await get().refreshSkills();
    }
  },

  // ── Skills ──────────────────────────────────────────────────────────────────
  skills: [],
  recents: [],
  isLoading: false,
  setSkills: (skills) => set({ skills }),
  setRecents: (recents) => set({ recents }),
  refreshSkills: async () => {
    set({ isLoading: true });
    try {
      const { workspaceFolder } = get();
      const [skills, recents] = await Promise.all([
        window.deluluAPI.scanSkills(workspaceFolder ?? undefined),
        window.deluluAPI.getRecents(),
      ]);
      set({ skills, recents });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSkill: async (path: string) => {
    await window.deluluAPI.deleteFile(path);
    get().closeTab(path);
    await get().refreshSkills();
  },

  // ── Local Agents ────────────────────────────────────────────────────────────
  detectedAgents: [],
  refreshAgents: async () => {
    try {
      const agents = await window.deluluAPI.detectAgents();
      set({ detectedAgents: agents });

      const { settings } = get();
      if (!settings.claudeApiKey) {
        const detectedClaude = agents.find((a) => a.id === 'claude' && a.detected);
        const detectedGemini = agents.find((a) => a.id === 'gemini' && a.detected);
        const detectedOllama = agents.find((a) => a.id === 'ollama' && a.detected);

        if (detectedClaude?.apiKey) {
          set((s) => ({ settings: { ...s.settings, claudeApiKey: detectedClaude.apiKey || '' } }));
        } else if (detectedGemini?.apiKey) {
          set((s) => ({
            settings: {
              ...s.settings,
              activeProvider: 'gemini',
              geminiApiKey: detectedGemini.apiKey || '',
              defaultModel: 'gemini-2.0-flash',
            },
          }));
        } else if (detectedOllama) {
          set((s) => ({
            settings: {
              ...s.settings,
              activeProvider: 'ollama',
              defaultModel: detectedOllama.defaultModel || 'gemma3:1b',
            },
          }));
        }
      }
    } catch {
      // ignore
    }
  },

  // ── Execution Logs ──────────────────────────────────────────────────────────
  executionLogs: [],
  addExecutionLog: (log) =>
    set((s) => ({
      executionLogs: [log, ...s.executionLogs].slice(0, 50),
    })),
  clearExecutionLogs: () => set({ executionLogs: [] }),

  // ── Editor tabs ─────────────────────────────────────────────────────────────
  tabs: [],
  activeTab: null,

  openSkill: async (skill) => {
    const { tabs } = get();
    if (!tabs.find((t) => t.path === skill.path)) {
      const content = await window.deluluAPI.readFile(skill.path);
      set({ tabs: [...tabs, { path: skill.path, name: skill.name, content, isDirty: false }] });
    }
    set({ activeTab: skill.path, view: 'editor', panel: 'explorer' });
    await window.deluluAPI.addRecent(skill.path, skill.name);
    const recents = await window.deluluAPI.getRecents();
    set({ recents });
  },

  openFile: async (filePath, name) => {
    const { tabs } = get();
    const fileName = name || filePath.split('/').pop() || 'Untitled';
    if (!tabs.find((t) => t.path === filePath)) {
      const content = await window.deluluAPI.readFile(filePath);
      set({ tabs: [...tabs, { path: filePath, name: fileName, content, isDirty: false }] });
    }
    set({ activeTab: filePath, view: 'editor', panel: 'explorer' });
    await window.deluluAPI.addRecent(filePath, fileName);
    const recents = await window.deluluAPI.getRecents();
    set({ recents });
  },

  closeTab: (path) => {
    const { tabs, activeTab } = get();
    const idx = tabs.findIndex((t) => t.path === path);
    const next = tabs.filter((t) => t.path !== path);
    let newActive = activeTab;
    if (activeTab === path) {
      newActive = next[Math.max(0, idx - 1)]?.path ?? null;
    }
    set({ tabs: next, activeTab: newActive });
    if (next.length === 0) set({ view: 'welcome' });
  },

  focusTab: (path) => set({ activeTab: path, view: 'editor' }),

  updateContent: (path, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.path === path ? { ...t, content, isDirty: true } : t)),
    })),

  saveTab: async (path) => {
    const tab = get().tabs.find((t) => t.path === path);
    if (!tab) return;
    await window.deluluAPI.writeFile(path, tab.content);
    set((s) => ({
      tabs: s.tabs.map((t) => (t.path === path ? { ...t, isDirty: false } : t)),
    }));
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  search: '',
  setSearch: (search) => set({ search }),

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: DEFAULT_SETTINGS,
  updateSetting: async (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }));
    if (key === 'theme') {
      const t = value as 'dark' | 'light';
      set({ theme: t });
      document.documentElement.classList.toggle('light', t === 'light');
      document.documentElement.classList.toggle('dark', t === 'dark');
      document.documentElement.setAttribute('data-theme', t);
    }
    await window.deluluAPI.setSetting(key, value);
  },

  // ── Builder ─────────────────────────────────────────────────────────────────
  builderPreset: null,
  setBuilderPreset: (preset) => set({ builderPreset: preset }),

  // ── Init ────────────────────────────────────────────────────────────────────
  init: async () => {
    set({ isLoading: true });
    try {
      const [
        workspace,
        theme,
        activeProvider,
        useLocalSession,
        claudeApiKey,
        geminiApiKey,
        openaiApiKey,
        defaultModel,
        fontSize,
      ] = await Promise.all([
        window.deluluAPI.getWorkspace(),
        window.deluluAPI.getSetting('theme'),
        window.deluluAPI.getSetting('activeProvider'),
        window.deluluAPI.getSetting('useLocalSession'),
        window.deluluAPI.getSetting('claudeApiKey'),
        window.deluluAPI.getSetting('geminiApiKey'),
        window.deluluAPI.getSetting('openaiApiKey'),
        window.deluluAPI.getSetting('defaultModel'),
        window.deluluAPI.getSetting('fontSize'),
      ]);

      const resolvedTheme = (theme as 'dark' | 'light') ?? 'dark';
      document.documentElement.classList.toggle('light', resolvedTheme === 'light');
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', resolvedTheme);

      set({
        workspaceFolder: (workspace as string) ?? null,
        theme: resolvedTheme,
        settings: {
          ...DEFAULT_SETTINGS,
          theme: resolvedTheme,
          activeProvider: (activeProvider as typeof DEFAULT_SETTINGS.activeProvider) ?? 'claude',
          useLocalSession: useLocalSession !== false,
          claudeApiKey: (claudeApiKey as string) ?? '',
          geminiApiKey: (geminiApiKey as string) ?? '',
          openaiApiKey: (openaiApiKey as string) ?? '',
          defaultModel: (defaultModel as string) ?? DEFAULT_SETTINGS.defaultModel,
          fontSize: (fontSize as number) ?? DEFAULT_SETTINGS.fontSize,
        },
      });

      const [skills, recents] = await Promise.all([
        window.deluluAPI.scanSkills((workspace as string) ?? undefined),
        window.deluluAPI.getRecents(),
      ]);
      set({ skills, recents });

      await get().refreshAgents();
    } finally {
      set({ isLoading: false });
    }
  },
}));
