import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  BotIcon,
  CheckIcon,
  SparklesIcon,
  RefreshIcon,
  FolderIcon,
  FlaskConicalIcon,
} from '../shared/Icons';

export default function AgentsView() {
  const { settings, updateSetting, detectedAgents, refreshAgents, setView } = useStore();

  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);

  const handleSelectProvider = (providerId: 'claude' | 'gemini' | 'ollama' | 'openai') => {
    updateSetting('activeProvider', providerId);
    const agent = detectedAgents.find((a) => a.id === providerId);
    if (agent?.defaultModel) {
      updateSetting('defaultModel', agent.defaultModel);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base select-none animate-fade-in">
      {/* Header Banner */}
      <div className="px-8 py-4 border-b border-line bg-surface flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <BotIcon size={16} className="text-accent" />
            <h1 className="text-sm font-semibold text-ink tracking-tight font-sans">
              Local AI Agents & Sessions
            </h1>
          </div>
          <p className="text-2xs text-ink-muted mt-0.5">
            Auto-detected local AI environments, sessions, and CLI tool configurations on your machine.
          </p>
        </div>

        <button
          onClick={() => refreshAgents()}
          className="btn-outline text-xs py-1 px-2.5"
          title="Rescan local agent sessions"
        >
          <RefreshIcon size={12} />
          <span>Rescan Sessions</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-8 py-6 max-w-3xl">
        {/* Active Engine Card */}
        <div className="mb-6 p-4 rounded-xl border border-accent/40 bg-surface-2/90 shadow-glow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ok animate-pulse" />
              <div>
                <span className="text-3xs font-mono uppercase tracking-wider text-accent-bright font-semibold">
                  Active Evals Engine
                </span>
                <h2 className="text-xs font-semibold text-ink font-sans">
                  {activeAgent?.name || 'Local Session'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-3xs font-mono bg-surface-3 border border-line text-ink-muted px-2 py-0.5 rounded">
                Model: {settings.defaultModel}
              </span>
              <button
                onClick={() => setView('evals')}
                className="btn-primary text-xs py-1 px-2.5"
              >
                <FlaskConicalIcon size={12} />
                <span>Test in Evals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detected Local Agents Grid */}
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="text-2xs font-semibold uppercase tracking-wider text-ink-dim font-sans">
            Detected Local Environments & Sessions
          </h2>

          {detectedAgents.map((agent) => {
            const isSelected = activeProvider === agent.id;
            return (
              <div
                key={agent.id}
                className={`
                  p-4 rounded-xl border transition-all duration-150 flex flex-col gap-3
                  ${isSelected
                    ? 'bg-surface-2 border-accent shadow-sm'
                    : 'bg-surface border-line hover:border-line-bright'}
                `}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        agent.detected
                          ? 'bg-accent/15 text-accent-bright border border-accent/30'
                          : 'bg-surface-3 text-ink-dim border border-line'
                      }`}
                    >
                      <BotIcon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-ink truncate font-sans">
                          {agent.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-3xs font-mono px-1.5 py-0.2 rounded-full border ${
                            agent.detected
                              ? 'text-ok border-ok/30 bg-ok/10'
                              : 'text-ink-dim border-line bg-surface-3'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${agent.detected ? 'bg-ok' : 'bg-ink-dim'}`}
                          />
                          <span>{agent.detected ? 'Detected' : 'Not Found'}</span>
                        </span>
                      </div>
                      <p className="text-3xs font-mono text-ink-dim truncate mt-0.5">
                        Source: {agent.source}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-bright bg-surface-3 px-2.5 py-1 rounded-md border border-accent/40 font-mono">
                        <CheckIcon size={12} />
                        <span>Active Engine</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectProvider(agent.id as typeof activeProvider)}
                        disabled={!agent.detected && !agent.hasSession}
                        className="btn-outline text-xs py-1 px-2.5 disabled:opacity-30"
                      >
                        Select Engine
                      </button>
                    )}
                  </div>
                </div>

                {/* Details / Description */}
                {agent.details && (
                  <p className="text-xs text-ink-muted leading-relaxed bg-base/50 p-2.5 rounded border border-line/60">
                    {agent.details}
                  </p>
                )}

                {/* MCP Tools Attached (for Claude) */}
                {agent.mcpServers && agent.mcpServers.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-3xs font-mono uppercase tracking-wider text-ink-dim">
                      Active Local MCP Servers ({agent.mcpServers.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.mcpServers.map((s) => (
                        <span key={s} className="tag text-3xs font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Selector if active */}
                {isSelected && (
                  <div className="flex items-center gap-3 pt-2 border-t border-line/80 mt-1">
                    <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim shrink-0">
                      Model Selection:
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => updateSetting('defaultModel', e.target.value)}
                      className="input font-mono text-xs py-1 flex-1"
                    >
                      {agent.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Manual API Key Overrides */}
        <section className="bg-surface border border-line rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-ink uppercase tracking-wider font-sans mb-3">
            Custom API Keys & Overrides
          </h2>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim">
                Anthropic API Key (Optional if ~/.claude.json exists)
              </label>
              <input
                type="password"
                value={settings.claudeApiKey}
                onChange={(e) => updateSetting('claudeApiKey', e.target.value)}
                placeholder="sk-ant-api03-…"
                className="input font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim">
                Google Gemini API Key (Optional if GEMINI_API_KEY env is set)
              </label>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
                placeholder="AIzaSy…"
                className="input font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim">
                OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                placeholder="sk-proj-…"
                className="input font-mono text-xs"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
