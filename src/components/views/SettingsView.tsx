import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  SettingsIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  BotIcon,
  CheckIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  KeyIcon,
} from '../shared/Icons';

export default function SettingsView() {
  const {
    settings,
    updateSetting,
    theme,
    toggleTheme,
    detectedAgents,
    refreshAgents,
    setView,
  } = useStore();

  // Accordion state: which agent cards are expanded (by default only active agent or none)
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [apiKeysExpanded, setApiKeysExpanded] = useState(false);

  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);

  const toggleAgentExpanded = (agentId: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const handleSelectProvider = (providerId: 'claude' | 'gemini' | 'ollama' | 'openai') => {
    updateSetting('activeProvider', providerId);
    const agent = detectedAgents.find((a) => a.id === providerId);
    if (agent?.defaultModel) {
      updateSetting('defaultModel', agent.defaultModel);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base select-none animate-fade-in font-sans">
      {/* Header */}
      <div className="px-8 py-4 border-b border-line bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SettingsIcon size={16} className="text-accent" />
          <h1 className="text-sm font-semibold text-ink tracking-tight font-sans">
            Preferences & Settings
          </h1>
        </div>

        <button
          onClick={() => refreshAgents()}
          className="btn-outline text-xs py-1 px-2.5"
          title="Rescan local agent sessions and models"
        >
          <RefreshIcon size={12} />
          <span>Rescan Agents</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-8 py-6 max-w-3xl">
        {/* Active Engine Banner */}
        <div className="mb-6 p-3.5 rounded-xl border border-accent/40 bg-surface-2/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ok animate-pulse" />
            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-accent-bright font-semibold">
                Active Evals Engine:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-ink">
                  {activeAgent?.name || 'Local Session'}
                </span>
                <span className="text-3xs font-mono bg-surface-3 border border-line text-ink-muted px-1.5 py-0.2 rounded">
                  {settings.defaultModel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setView('evals')}
            className="btn-primary text-xs py-1 px-3"
            title="Open Evals Test Runner"
          >
            <FlaskConicalIcon size={12} />
            <span>Test in Evals</span>
          </button>
        </div>

        {/* Section 1: Local AI Agents & Sessions (Collapsible Cards) */}
        <Section
          title="Local AI Agents & Engines"
          description="Auto-detected local AI environments, CLI sessions, and model runtimes."
        >
          <div className="flex flex-col gap-2">
            {detectedAgents.map((agent) => {
              const isSelected = activeProvider === agent.id;
              const isExpanded = !!expandedAgents[agent.id];

              return (
                <div
                  key={agent.id}
                  className={`
                    rounded-xl border transition-all duration-150 overflow-hidden
                    ${isSelected
                      ? 'bg-surface-2/90 border-accent/60 shadow-sm'
                      : 'bg-surface border-line hover:border-line-bright'}
                  `}
                >
                  {/* Collapsible Header Row (Click to toggle expansion) */}
                  <div
                    onClick={() => toggleAgentExpanded(agent.id)}
                    className="flex items-center justify-between p-3 cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-ink-dim hover:text-ink transition-colors">
                        {isExpanded ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          agent.detected
                            ? 'bg-accent/15 text-accent-bright border border-accent/30'
                            : 'bg-surface-3 text-ink-dim border border-line'
                        }`}
                      >
                        <BotIcon size={13} />
                      </div>

                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span className="text-xs font-semibold text-ink truncate font-sans">
                          {agent.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-3xs font-mono px-1.5 py-0.2 rounded-full border ${
                            agent.detected
                              ? 'text-ok border-ok/30 bg-ok/10'
                              : 'text-ink-dim border-line bg-surface-3'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              agent.detected ? 'bg-ok' : 'bg-ink-dim'
                            }`}
                          />
                          <span>{agent.detected ? 'Detected' : 'Not Found'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-3xs font-medium text-accent-bright bg-surface-3 px-2 py-0.8 rounded border border-accent/40 font-mono">
                          <CheckIcon size={10} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectProvider(agent.id as typeof activeProvider)}
                          disabled={!agent.detected && !agent.hasSession}
                          className="btn-outline text-3xs py-0.5 px-2 disabled:opacity-30"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Body Details (Only visible when opened) */}
                  {isExpanded && (
                    <div className="px-4 pb-3.5 pt-1 border-t border-line/60 bg-base/30 flex flex-col gap-3 animate-fade-in">
                      {/* Source & Description */}
                      <div className="flex items-center justify-between text-3xs font-mono text-ink-dim">
                        <span>Config Location: {agent.source}</span>
                        {agent.hasSession && (
                          <span className="text-ok font-medium">● Active Session Ready</span>
                        )}
                      </div>

                      {agent.details && (
                        <p className="text-xs text-ink-muted leading-relaxed bg-surface/70 p-2.5 rounded border border-line/60">
                          {agent.details}
                        </p>
                      )}

                      {/* MCP Tools (e.g. Claude) */}
                      {agent.mcpServers && agent.mcpServers.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-3xs font-mono uppercase tracking-wider text-ink-dim font-semibold">
                            Active Local MCP Tools ({agent.mcpServers.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {agent.mcpServers.map((s) => (
                              <span key={s} className="tag text-3xs font-mono">
                                🔌 {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Model Selector Dropdown */}
                      {agent.models && agent.models.length > 0 && (
                        <div className="flex items-center gap-3 pt-2 border-t border-line/60">
                          <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim shrink-0 font-semibold">
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
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 2: Custom API Keys & Overrides (Collapsible Accordion) */}
        <div className="mb-7 rounded-xl border border-line bg-surface overflow-hidden">
          <div
            onClick={() => setApiKeysExpanded(!apiKeysExpanded)}
            className="flex items-center justify-between p-3.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-ink-dim">
                {apiKeysExpanded ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
              </span>
              <KeyIcon size={14} className="text-accent" />
              <span className="text-xs font-semibold text-ink">
                Custom API Keys & Overrides
              </span>
            </div>
            <span className="text-3xs font-mono text-ink-dim">
              {apiKeysExpanded ? 'Hide' : 'Configure'}
            </span>
          </div>

          {apiKeysExpanded && (
            <div className="p-4 pt-1 border-t border-line/60 bg-base/20 flex flex-col gap-3.5 animate-fade-in">
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
          )}
        </div>

        {/* Section 3: Appearance & Editor Customization */}
        <Section title="Appearance & Editor">
          <Row
            label="Theme Mode"
            description="Toggle between high-contrast dark theme and clean light theme"
          >
            <button onClick={toggleTheme} className="btn-outline text-xs">
              {theme === 'dark' ? (
                <>
                  <SunIcon size={13} />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <MoonIcon size={13} />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </Row>

          <Row
            label="Editor Font Size"
            description="Adjust code editor font size (default: 13px)"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={11}
                max={20}
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                className="input w-16 text-center font-mono text-xs py-1"
              />
              <span className="text-3xs font-mono text-ink-dim">px</span>
            </div>
          </Row>

          <Row
            label="Font Ligatures"
            description="Enable programming font ligatures in code editor"
          >
            <button
              onClick={() => updateSetting('fontLigatures', !settings.fontLigatures)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                settings.fontLigatures ? 'bg-accent' : 'bg-surface-4'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                  settings.fontLigatures ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </Row>
        </Section>

        {/* Section 4: About App */}
        <Section title="About Delulu">
          <div className="p-4 rounded-xl bg-surface border border-line flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <SparklesIcon size={15} className="text-accent" />
              <span className="font-semibold text-xs text-ink font-sans tracking-tight">
                Delulu AI Skill IDE
              </span>
              <span className="text-3xs font-mono bg-surface-3 border border-line text-ink-dim px-1.5 py-0.2 rounded">
                v0.1.0
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Precision IDE for authoring, evaluating, and symlinking AI agent skills.
            </p>
            <div className="flex items-center gap-3 pt-2 text-3xs font-mono text-ink-dim border-t border-line mt-1">
              <span>Stack: Electron 33 · React 19 · Monaco · Tailwind</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <div className="mb-2.5">
        <h2 className="text-2xs font-semibold text-ink uppercase tracking-wider font-sans">
          {title}
        </h2>
        {description && (
          <p className="text-3xs text-ink-dim mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-line">
      <div className="flex flex-col pr-4">
        <span className="text-xs font-medium text-ink">{label}</span>
        {description && (
          <span className="text-3xs text-ink-dim mt-0.5">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
