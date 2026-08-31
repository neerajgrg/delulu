import React, { useState, useMemo, useRef } from 'react';
import { useStore, type BottomTab } from '../../store/useStore';
import { analyzeSkillContent } from '../../lib/skillLinter';
import {
  FlaskConicalIcon,
  SparklesIcon,
  PlayIcon,
  XIcon,
  CheckIcon,
  FolderIcon,
} from '../shared/Icons';

export default function BottomConsole() {
  const {
    isBottomConsoleOpen,
    toggleBottomConsole,
    bottomConsoleTab,
    setBottomConsoleTab,
    tabs,
    activeTab,
    settings,
    detectedAgents,
    executionLogs,
    addExecutionLog,
    clearExecutionLogs,
    workspaceFolder,
    updateContent,
  } = useStore();

  const currentTab = tabs.find((t) => t.path === activeTab);
  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);

  // REPL State
  const [replInput, setReplInput] = useState('');
  const [replOutput, setReplOutput] = useState('');
  const [replRunning, setReplRunning] = useState(false);
  const replInputRef = useRef<HTMLInputElement>(null);

  // Analyze active skill for problems
  const problems = useMemo(() => {
    if (!currentTab) return [];
    return analyzeSkillContent(currentTab.content);
  }, [currentTab]);

  const handleRunRepl = async () => {
    if (!replInput.trim() || replRunning || !currentTab) return;
    const prompt = replInput.trim();
    setReplRunning(true);
    setReplOutput('⚡ Executing skill with ' + (activeAgent?.name || activeProvider) + '…');

    const startTime = Date.now();
    try {
      const apiKey =
        activeProvider === 'gemini'
          ? settings.geminiApiKey
          : activeProvider === 'openai'
          ? settings.openaiApiKey
          : settings.claudeApiKey;

      const res = await window.deluluAPI.runEval({
        provider: activeProvider,
        skillContent: currentTab.content,
        userInput: prompt,
        apiKey,
        model: settings.defaultModel,
        useLocalSession: settings.useLocalSession,
      });

      const durationMs = Date.now() - startTime;
      setReplOutput(res);

      addExecutionLog({
        id: `exec-${Date.now()}`,
        timestamp: Date.now(),
        skillName: currentTab.name,
        provider: activeProvider,
        model: settings.defaultModel,
        prompt,
        response: res,
        durationMs,
        status: 'success',
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errMsg = `❌ Error: ${String(err)}`;
      setReplOutput(errMsg);

      addExecutionLog({
        id: `exec-${Date.now()}`,
        timestamp: Date.now(),
        skillName: currentTab.name,
        provider: activeProvider,
        model: settings.defaultModel,
        prompt,
        response: errMsg,
        durationMs,
        status: 'error',
      });
    } finally {
      setReplRunning(false);
    }
  };

  if (!isBottomConsoleOpen) return null;

  return (
    <div
      className="border-t border-line bg-surface select-none flex flex-col shrink-0 animate-slide-up z-20"
      style={{ height: 210 }}
    >
      {/* Console Tab Bar */}
      <div className="flex items-center justify-between px-3 bg-surface-2 border-b border-line shrink-0" style={{ height: 32 }}>
        <div className="flex items-center gap-1">
          <TabButton
            active={bottomConsoleTab === 'problems'}
            onClick={() => setBottomConsoleTab('problems')}
            label="Problems"
            badge={problems.length}
            badgeColor={problems.length > 0 ? 'bg-warn text-black' : undefined}
          />
          <TabButton
            active={bottomConsoleTab === 'repl'}
            onClick={() => setBottomConsoleTab('repl')}
            label="Skill REPL"
            icon={<FlaskConicalIcon size={12} />}
          />
          <TabButton
            active={bottomConsoleTab === 'logs'}
            onClick={() => setBottomConsoleTab('logs')}
            label="Agent Logs"
            badge={executionLogs.length}
            icon={<SparklesIcon size={12} />}
          />
          <TabButton
            active={bottomConsoleTab === 'terminal'}
            onClick={() => setBottomConsoleTab('terminal')}
            label="System & Workspace"
          />
        </div>

        <div className="flex items-center gap-2">
          {bottomConsoleTab === 'logs' && executionLogs.length > 0 && (
            <button
              onClick={clearExecutionLogs}
              className="btn-ghost text-3xs py-0.5 px-2 text-ink-dim hover:text-ink"
            >
              Clear Logs
            </button>
          )}
          <button
            onClick={toggleBottomConsole}
            className="text-ink-dim hover:text-ink p-1 rounded hover:bg-surface-3 transition-colors"
            title="Close Panel (⌘J)"
          >
            <XIcon size={13} />
          </button>
        </div>
      </div>

      {/* Console Content Area */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs bg-base">
        {/* 1. Problems Tab */}
        {bottomConsoleTab === 'problems' && (
          <div className="flex flex-col gap-1.5">
            {problems.length === 0 ? (
              <div className="flex items-center gap-2 text-ok py-3 px-2">
                <CheckIcon size={14} />
                <span>No diagnostics found. Active skill is well-structured!</span>
              </div>
            ) : (
              problems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-2 rounded bg-surface border border-line hover:border-line-bright transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-3xs uppercase font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                        p.severity === 'warning'
                          ? 'bg-warn/15 text-warn border border-warn/30'
                          : 'bg-accent/15 text-accent-bright border border-accent/30'
                      }`}
                    >
                      {p.severity}
                    </span>
                    <span className="text-ink font-semibold truncate font-sans text-xs">{p.title}</span>
                    <span className="text-ink-dim text-3xs truncate">{p.description}</span>
                  </div>
                  {currentTab && (
                    <button
                      onClick={() => {
                        const next = p.applyPatch(currentTab.content);
                        updateContent(currentTab.path, next);
                      }}
                      className="btn-primary text-3xs py-0.5 px-2 shrink-0"
                    >
                      Quick Fix
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. REPL Tab */}
        {bottomConsoleTab === 'repl' && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={replInputRef}
                type="text"
                value={replInput}
                onChange={(e) => setReplInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunRepl()}
                placeholder={
                  currentTab
                    ? `Test prompt against ${currentTab.name} (${activeAgent?.name || activeProvider})…`
                    : 'Open a skill in editor to test…'
                }
                disabled={!currentTab || replRunning}
                className="input flex-1 text-xs py-1"
              />
              <button
                onClick={handleRunRepl}
                disabled={!currentTab || replRunning || !replInput.trim()}
                className="btn-primary text-xs py-1 px-3 shrink-0"
              >
                <PlayIcon size={11} />
                <span>{replRunning ? 'Running…' : 'Execute'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 rounded bg-surface border border-line text-xs whitespace-pre-wrap select-text leading-relaxed">
              {replOutput || <span className="text-ink-dim">Interactive response will appear here…</span>}
            </div>
          </div>
        )}

        {/* 3. Execution Logs Tab */}
        {bottomConsoleTab === 'logs' && (
          <div className="flex flex-col gap-2">
            {executionLogs.length === 0 ? (
              <div className="text-ink-dim py-4 text-center text-xs">
                No execution logs recorded yet. Run a prompt in Evals or the Skill REPL to see live metrics.
              </div>
            ) : (
              executionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-surface border border-line flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-3xs text-ink-dim border-b border-line pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-ink font-semibold">{log.skillName}</span>
                      <span>·</span>
                      <span className="text-accent-bright">{log.provider} ({log.model})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ok font-medium">{log.durationMs}ms</span>
                      <span>·</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="text-ink-dim text-3xs">
                    <span className="text-ink-muted font-semibold">Prompt:</span> {log.prompt}
                  </div>
                  <div className="text-ink text-xs whitespace-pre-wrap bg-base p-1.5 rounded border border-line/60">
                    {log.response}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Terminal & Workspace Info */}
        {bottomConsoleTab === 'terminal' && (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <FolderIcon size={14} className="text-accent" />
              <span>Workspace Directory:</span>
              <code className="text-ink bg-surface px-1.5 py-0.2 rounded border border-line">
                {workspaceFolder || 'No workspace opened'}
              </code>
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
              <SparklesIcon size={14} className="text-accent" />
              <span>Active AI Agent:</span>
              <span className="text-ink font-semibold">{activeAgent?.name || 'Local Session'}</span>
              <span className="text-3xs text-ink-dim">({activeAgent?.source})</span>
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
              <span>Environment:</span>
              <span className="text-ink-dim font-mono text-3xs">
                Electron 33 · Node.js · Darwin arm64 · Monaco Editor 0.52
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
  badgeColor,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  badgeColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1 text-xs font-sans transition-colors rounded-t
        ${active
          ? 'bg-base text-ink font-semibold border-t-2 border-t-accent'
          : 'text-ink-muted hover:text-ink hover:bg-surface-3 border-t-2 border-t-transparent'}
      `}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={`text-3xs font-mono px-1.5 py-0.2 rounded-full ${
            badgeColor || (active ? 'bg-accent/20 text-accent-bright' : 'bg-surface-3 text-ink-dim')
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
