import type {
  SkillFile,
  RecentSkill,
  LocalAgentInfo,
  EvalRunParams,
  SymlinkTarget,
  FileTreeNode,
} from '../types/delulu';

const SAMPLE_A11Y_TREE: FileTreeNode = {
  name: 'a11y-debugging',
  path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging',
  type: 'directory',
  children: [
    {
      name: 'SKILL.md',
      path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md',
      type: 'file',
      extension: '.md',
      isSkillDoc: true,
    },
    {
      name: 'scripts',
      path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/scripts',
      type: 'directory',
      children: [
        {
          name: 'audit_runner.py',
          path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/scripts/audit_runner.py',
          type: 'file',
          extension: '.py',
        },
      ],
    },
    {
      name: 'references',
      path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/references',
      type: 'directory',
      children: [
        {
          name: 'web_dev_a11y_guidelines.md',
          path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/references/web_dev_a11y_guidelines.md',
          type: 'file',
          extension: '.md',
        },
      ],
    },
  ],
};

const SAMPLE_DEVTOOLS_TREE: FileTreeNode = {
  name: 'chrome-devtools',
  path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools',
  type: 'directory',
  children: [
    {
      name: 'SKILL.md',
      path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md',
      type: 'file',
      extension: '.md',
      isSkillDoc: true,
    },
    {
      name: 'resources',
      path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/resources',
      type: 'directory',
      children: [
        {
          name: 'network_filters.json',
          path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/resources/network_filters.json',
          type: 'file',
          extension: '.json',
        },
      ],
    },
  ],
};

const SAMPLE_SKILLS: SkillFile[] = [
  {
    path: '/Users/demo/.delulu/skills/code-review.skill.md',
    name: 'code-review',
    description: 'Inspect code for quality, potential bugs, edge cases, and style improvements.',
    tags: ['code', 'review', 'quality'],
    trigger: 'review',
    source: 'custom',
    quality: 5,
    mtime: Date.now() - 3600000,
  },
  {
    path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md',
    name: 'a11y-debugging',
    description: 'Uses Chrome DevTools MCP for accessibility auditing, focus states, and ARIA tree debugging.',
    tags: ['a11y', 'devtools', 'audit', 'plugin'],
    trigger: 'a11y',
    source: 'plugin',
    pluginName: 'chrome-devtools-plugin',
    folderPath: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging',
    isFolder: true,
    tree: SAMPLE_A11Y_TREE,
    quality: 5,
    mtime: Date.now() - 1800000,
  },
  {
    path: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md',
    name: 'chrome-devtools',
    description: 'Automates browser interaction, performance profiling, and network request inspection.',
    tags: ['devtools', 'browser', 'mcp', 'plugin'],
    trigger: 'browser',
    source: 'plugin',
    pluginName: 'chrome-devtools-plugin',
    folderPath: '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools',
    isFolder: true,
    tree: SAMPLE_DEVTOOLS_TREE,
    quality: 5,
    mtime: Date.now() - 2400000,
  },
  {
    path: '/Users/demo/.agents/skills/api-helper.skill.md',
    name: 'api-helper',
    description: 'Fetch data and transform REST and GraphQL API responses seamlessly.',
    tags: ['api', 'http', 'integration'],
    trigger: 'api',
    source: 'agents',
    quality: 4,
    mtime: Date.now() - 7200000,
  },
  {
    path: '/Users/demo/workspace/data-analyzer.skill.md',
    name: 'data-analyzer',
    description: 'Process structured tabular datasets, extract insights and detect anomalies.',
    tags: ['data', 'analytics', 'statistics'],
    trigger: 'analyze',
    source: 'workspace',
    quality: 4,
    mtime: Date.now() - 10800000,
  },
];

const mockFiles: Record<string, string> = {
  '/Users/demo/.delulu/skills/code-review.skill.md': `---
name: code-review
description: "Inspect code for quality, potential bugs, edge cases, and style improvements."
trigger: "review"
tags: [code, review, quality]
model: claude-3-5-sonnet-20241022
temperature: 0.3
max_tokens: 2048
---

# Code Review

## Description
Inspect code for quality, potential bugs, edge cases, and style improvements.

## Examples
- Input: def add(a, b): return a + b
- Output: Function is clean and concise.

## Constraints
- Do not modify existing function signatures without explicit permission.
`,
  '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md': `---
name: a11y-debugging
description: "Uses Chrome DevTools MCP for accessibility auditing, focus states, and ARIA tree debugging."
trigger: "a11y"
tags: [a11y, devtools, audit, plugin]
---

# Accessibility Debugging

## Description
Uses Chrome DevTools MCP for accessibility auditing, focus states, and ARIA tree debugging.

## Examples
- Run a11y audit on login form
- Test keyboard tab navigation order

## Constraints
- Do not modify production CSS directly without previewing.
`,
  '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/scripts/audit_runner.py': `#!/usr/bin/env python3
"""Accessibility audit runner helper script."""
import sys

def run_audit(url: str):
    print(f"Auditing accessibility for: {url}")
    return {"contrast_issues": 0, "aria_labels_missing": 0}

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    res = run_audit(url)
    print("Audit result:", res)
`,
  '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/references/web_dev_a11y_guidelines.md': `# Web.dev Accessibility Guidelines

1. Ensure color contrast ratio is at least 4.5:1 for normal text.
2. Provide explicit \`aria-label\` or visible label for all interactive buttons.
3. Keep DOM tabIndex navigation predictable.
`,
  '/Users/demo/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/resources/network_filters.json': `{
  "defaultFilters": ["xhr", "fetch", "websocket"],
  "captureHeaders": true,
  "maxBodyBytes": 1048576
}
`,
};

export function setupMockDeluluApi(): void {
  if (typeof window === 'undefined' || window.deluluAPI) return;

  const storage = window.localStorage;

  window.deluluAPI = {
    readFile: async (filePath: string): Promise<string> => {
      const stored = storage.getItem(`delulu_file:${filePath}`);
      if (stored !== null) return stored;
      if (mockFiles[filePath]) return mockFiles[filePath];
      return `# ${filePath.split('/').pop() || 'Untitled'}\n\nFile content for ${filePath}.`;
    },

    writeFile: async (filePath: string, content: string): Promise<void> => {
      storage.setItem(`delulu_file:${filePath}`, content);
      mockFiles[filePath] = content;
    },

    createFile: async (dir: string, name: string, content: string): Promise<string> => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
      const path = `${dir ? dir.replace(/\/+$/, '') : '/Users/demo/workspace'}/${slug}.skill.md`;
      storage.setItem(`delulu_file:${path}`, content);
      mockFiles[path] = content;

      const customList: SkillFile[] = JSON.parse(storage.getItem('delulu_custom_skills') || '[]');
      customList.unshift({
        path,
        name: slug,
        description: 'Newly created skill in workspace',
        tags: ['custom'],
        source: 'workspace',
        quality: 4,
        mtime: Date.now(),
      });
      storage.setItem('delulu_custom_skills', JSON.stringify(customList));

      return path;
    },

    deleteFile: async (filePath: string): Promise<void> => {
      storage.removeItem(`delulu_file:${filePath}`);
      delete mockFiles[filePath];
    },

    fileExists: async (filePath: string): Promise<boolean> => {
      return storage.getItem(`delulu_file:${filePath}`) !== null || !!mockFiles[filePath];
    },

    readDirTree: async (dirPath: string): Promise<FileTreeNode | null> => {
      if (dirPath.includes('a11y-debugging')) return SAMPLE_A11Y_TREE;
      if (dirPath.includes('chrome-devtools')) return SAMPLE_DEVTOOLS_TREE;
      return null;
    },

    scanSkills: async (_workspaceFolder?: string): Promise<SkillFile[]> => {
      const customList: SkillFile[] = JSON.parse(storage.getItem('delulu_custom_skills') || '[]');
      return [...customList, ...SAMPLE_SKILLS];
    },

    detectAgents: async (): Promise<LocalAgentInfo[]> => {
      return [
        {
          id: 'claude',
          name: 'Anthropic Claude',
          type: 'claude',
          detected: true,
          source: '~/.claude.json',
          details: 'Local Claude Code session found (7 MCP tools attached)',
          hasSession: true,
          models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-opus-4-5'],
          defaultModel: 'claude-3-5-sonnet-20241022',
          mcpServers: ['Documentation Search', 'Glean Workspace', 'Cloud Operations'],
        },
        {
          id: 'gemini',
          name: 'Google Gemini / Antigravity',
          type: 'gemini',
          detected: true,
          source: 'Environment (GEMINI_API_KEY)',
          details: 'Active Gemini session detected from environment',
          hasSession: true,
          models: ['gemini-2.0-flash', 'gemini-2.0-pro-exp', 'gemini-1.5-pro'],
          defaultModel: 'gemini-2.0-flash',
        },
        {
          id: 'ollama',
          name: 'Local Ollama Engine',
          type: 'ollama',
          detected: true,
          source: '~/.ollama (Installed)',
          details: 'Installed models: gemma3:1b (Local disk)',
          hasSession: true,
          models: ['gemma3:1b'],
          defaultModel: 'gemma3:1b',
        },
        {
          id: 'cursor',
          name: 'Cursor AI Agent',
          type: 'cursor',
          detected: true,
          source: '~/.cursor',
          details: 'Cursor agent rules and skills directory indexed',
          hasSession: true,
          models: ['cursor-claude-3.5', 'cursor-gpt-4o'],
          defaultModel: 'cursor-claude-3.5',
        },
      ];
    },

    getVaultDir: async (): Promise<string> => {
      return '/Users/demo/.delulu/skills';
    },

    getSymlinkTargets: async (skillName: string): Promise<SymlinkTarget[]> => {
      const stored = storage.getItem(`delulu_symlinks:${skillName}`);
      const activeLinks: string[] = stored ? JSON.parse(stored) : ['cursor', 'agents'];

      return [
        {
          id: 'cursor',
          name: 'Cursor IDE (.cursor/skills)',
          targetDir: '/Users/demo/.cursor/skills',
          isLinked: activeLinks.includes('cursor'),
          available: true,
        },
        {
          id: 'agents',
          name: 'Local Agents (.agents/skills)',
          targetDir: '/Users/demo/.agents/skills',
          isLinked: activeLinks.includes('agents'),
          available: true,
        },
        {
          id: 'claude',
          name: 'Claude Code (.claude/skills)',
          targetDir: '/Users/demo/.claude/skills',
          isLinked: activeLinks.includes('claude'),
          available: true,
        },
        {
          id: 'gemini',
          name: 'Google Gemini & Antigravity (.gemini/skills)',
          targetDir: '/Users/demo/.gemini/skills',
          isLinked: activeLinks.includes('gemini'),
          available: true,
        },
        {
          id: 'workspace',
          name: 'Workspace Skills (workspace/skills)',
          targetDir: '/Users/demo/workspace/skills',
          isLinked: activeLinks.includes('workspace'),
          available: true,
        },
      ];
    },

    importSkillToVault: async (
      fileName: string,
      content: string,
      targets: string[]
    ): Promise<{ vaultPath: string; linkedTo: string[] }> => {
      const cleanName = fileName.endsWith('.skill.md') ? fileName : `${fileName.replace(/\.md$/, '')}.skill.md`;
      const vaultPath = `/Users/demo/.delulu/skills/${cleanName}`;
      storage.setItem(`delulu_file:${vaultPath}`, content);
      storage.setItem(`delulu_symlinks:${cleanName}`, JSON.stringify(targets));

      const customList: SkillFile[] = JSON.parse(storage.getItem('delulu_custom_skills') || '[]');
      customList.unshift({
        path: vaultPath,
        name: cleanName.replace(/\.skill\.md$/, ''),
        description: 'Imported skill in Delulu Vault',
        tags: ['imported', 'vault'],
        source: 'custom',
        quality: 4,
        mtime: Date.now(),
      });
      storage.setItem('delulu_custom_skills', JSON.stringify(customList));

      return { vaultPath, linkedTo: targets };
    },

    toggleSymlink: async (skillName: string, targetId: string, enable: boolean): Promise<boolean> => {
      const stored = storage.getItem(`delulu_symlinks:${skillName}`);
      let activeLinks: string[] = stored ? JSON.parse(stored) : ['cursor', 'agents'];
      if (enable) {
        if (!activeLinks.includes(targetId)) activeLinks.push(targetId);
      } else {
        activeLinks = activeLinks.filter((t) => t !== targetId);
      }
      storage.setItem(`delulu_symlinks:${skillName}`, JSON.stringify(activeLinks));
      return true;
    },

    getRecents: async (): Promise<RecentSkill[]> => {
      const raw = storage.getItem('delulu_recents');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // ignore
        }
      }
      return [
        { path: '/Users/demo/.delulu/skills/code-review.skill.md', name: 'code-review', openedAt: Date.now() - 10000 },
        { path: '/Users/demo/.agents/skills/api-helper.skill.md', name: 'api-helper', openedAt: Date.now() - 60000 },
      ];
    },

    addRecent: async (filePath: string, name: string): Promise<void> => {
      let recents: RecentSkill[] = [];
      const raw = storage.getItem('delulu_recents');
      if (raw) {
        try { recents = JSON.parse(raw); } catch { /* ignore */ }
      }
      recents = recents.filter((r) => r.path !== filePath);
      recents.unshift({ path: filePath, name, openedAt: Date.now() });
      storage.setItem('delulu_recents', JSON.stringify(recents.slice(0, 10)));
    },

    openFolder: async (): Promise<string | null> => {
      return '/Users/demo/workspace';
    },

    getWorkspace: async (): Promise<string | null> => {
      return storage.getItem('delulu_workspace') || '/Users/demo/workspace';
    },

    setWorkspace: async (folder: string): Promise<boolean> => {
      storage.setItem('delulu_workspace', folder);
      return true;
    },

    getSetting: async (key: string): Promise<unknown> => {
      const val = storage.getItem(`delulu_setting:${key}`);
      if (val !== null) {
        try { return JSON.parse(val); } catch { return val; }
      }
      return null;
    },

    setSetting: async (key: string, value: unknown): Promise<void> => {
      storage.setItem(`delulu_setting:${key}`, JSON.stringify(value));
    },

    runEval: async (
      paramsOrSkillContent: string | EvalRunParams,
      legacyUserInput?: string
    ): Promise<string> => {
      const prompt = typeof paramsOrSkillContent === 'string' ? legacyUserInput : paramsOrSkillContent.userInput;
      const provider = typeof paramsOrSkillContent === 'object' ? paramsOrSkillContent.provider : 'claude';
      const model = typeof paramsOrSkillContent === 'object' ? paramsOrSkillContent.model : 'claude-3-5-sonnet';

      await new Promise((resolve) => setTimeout(resolve, 600));
      return `✨ [Delulu Local Agent Runner — ${provider?.toUpperCase()} (${model})]\n\nAnalysis of input: "${prompt}"\n\n- ✅ Inputs matched skill specification and guardrails.\n- 💡 Agent: Evaluated with local session successfully.\n- 🚀 Status: Skill passed verification.`;
    },

    platform: 'darwin',
    isDev: true,
  };
}
