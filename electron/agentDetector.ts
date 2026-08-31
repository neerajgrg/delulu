import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as http from 'http';
import type { IpcMain } from 'electron';

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

export async function detectLocalAgents(): Promise<LocalAgentInfo[]> {
  const home = os.homedir();
  const agents: LocalAgentInfo[] = [];

  // ── 1. Anthropic Claude (Claude Code / ~/.claude.json / Env) ───────────────
  const claudeJsonPath = path.join(home, '.claude.json');
  let hasClaudeSession = false;
  let claudeMcpServers: string[] = [];
  let claudeDetails = 'Claude Code CLI session not found';
  let claudeApiKey = process.env.ANTHROPIC_API_KEY || '';

  if (fs.existsSync(claudeJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf8'));
      hasClaudeSession = !!(data.oauthAccount || data.apiKey || data.primaryApiKey || data.userID);
      if (data.mcpServers && typeof data.mcpServers === 'object') {
        claudeMcpServers = Object.keys(data.mcpServers);
      }
      if (data.apiKey) claudeApiKey = data.apiKey;
      claudeDetails = hasClaudeSession
        ? `Local Claude session found (${claudeMcpServers.length} MCP servers attached)`
        : 'Config file found at ~/.claude.json';
    } catch {
      // ignore parse errors
    }
  }

  agents.push({
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'claude',
    detected: hasClaudeSession || !!claudeApiKey,
    source: hasClaudeSession ? '~/.claude.json' : 'API Key',
    details: claudeDetails,
    hasSession: hasClaudeSession,
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-opus-4-5',
      'claude-3-opus-20240229',
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    mcpServers: claudeMcpServers,
    apiKey: claudeApiKey,
  });

  // ── 2. Google Gemini / Antigravity (~/.gemini / GEMINI_API_KEY) ───────────
  const geminiEnvKey = process.env.GEMINI_API_KEY || '';
  const geminiDir = path.join(home, '.gemini');
  const hasGeminiDir = fs.existsSync(geminiDir);
  const isGeminiDetected = !!geminiEnvKey || hasGeminiDir;

  agents.push({
    id: 'gemini',
    name: 'Google Gemini / Antigravity',
    type: 'gemini',
    detected: isGeminiDetected,
    source: geminiEnvKey ? 'Environment (GEMINI_API_KEY)' : '~/.gemini',
    details: geminiEnvKey
      ? 'Active Gemini API session detected from environment'
      : hasGeminiDir
      ? 'Antigravity workspace configuration found at ~/.gemini'
      : 'Gemini session not detected',
    hasSession: isGeminiDetected,
    models: [
      'gemini-2.0-flash',
      'gemini-2.0-pro-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    defaultModel: 'gemini-2.0-flash',
    apiKey: geminiEnvKey,
  });

  // ── 3. Local Ollama (~/.ollama / localhost:11434) ──────────────────────────
  const ollamaDir = path.join(home, '.ollama');
  const hasOllamaDir = fs.existsSync(ollamaDir);
  const installedOllamaModels: string[] = [];

  // Check models on disk
  const manifestsDir = path.join(ollamaDir, 'models', 'manifests');
  if (fs.existsSync(manifestsDir)) {
    try {
      function findManifests(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) findManifests(full);
          else {
            const rel = full.replace(manifestsDir + path.sep, '');
            const modelName = rel.replace(/^registry\.ollama\.ai[\\/](library[\\/])?/, '').replace(/[\\/]/g, ':');
            if (modelName && !installedOllamaModels.includes(modelName)) {
              installedOllamaModels.push(modelName);
            }
          }
        }
      }
      findManifests(manifestsDir);
    } catch {
      // ignore
    }
  }

  // Check if Ollama daemon is running
  const isOllamaRunning = await new Promise<boolean>((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: 11434, path: '/api/tags', timeout: 800 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });

  agents.push({
    id: 'ollama',
    name: 'Local Ollama Engine',
    type: 'ollama',
    detected: hasOllamaDir || isOllamaRunning || installedOllamaModels.length > 0,
    source: isOllamaRunning ? 'http://127.0.0.1:11434 (Running)' : '~/.ollama (Installed)',
    details: installedOllamaModels.length > 0
      ? `Installed models: ${installedOllamaModels.join(', ')} (${isOllamaRunning ? 'Service Active' : 'Offline'})`
      : hasOllamaDir
      ? 'Ollama storage found at ~/.ollama'
      : 'Ollama not installed',
    hasSession: isOllamaRunning || installedOllamaModels.length > 0,
    models: installedOllamaModels.length > 0 ? installedOllamaModels : ['gemma3:1b', 'llama3:8b', 'mistral:7b', 'qwen2.5-coder:7b'],
    defaultModel: installedOllamaModels[0] || 'gemma3:1b',
  });

  // ── 4. Cursor Agent (~/.cursor) ───────────────────────────────────────────
  const cursorDir = path.join(home, '.cursor');
  const hasCursor = fs.existsSync(cursorDir);

  agents.push({
    id: 'cursor',
    name: 'Cursor AI Rules & Agent',
    type: 'cursor',
    detected: hasCursor,
    source: '~/.cursor',
    details: hasCursor
      ? 'Cursor agent rules and skills directory indexed'
      : 'Cursor configuration not detected',
    hasSession: hasCursor,
    models: ['cursor-composer', 'cursor-claude-3.5', 'cursor-gpt-4o'],
    defaultModel: 'cursor-claude-3.5',
  });

  // ── 5. OpenAI (~/.openai / Env) ───────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY || '';

  agents.push({
    id: 'openai',
    name: 'OpenAI (GPT-4o / o1)',
    type: 'openai',
    detected: !!openaiKey,
    source: openaiKey ? 'Environment (OPENAI_API_KEY)' : 'API Key',
    details: openaiKey ? 'OpenAI key detected from environment' : 'Not configured',
    hasSession: !!openaiKey,
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'],
    defaultModel: 'gpt-4o',
    apiKey: openaiKey,
  });

  return agents;
}

export function registerAgentDetectorHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('agents:detect', () => detectLocalAgents());
}
