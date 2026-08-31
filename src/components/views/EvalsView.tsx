import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import MarkdownPreview from '../editor/MarkdownPreview';
import SkillMarkmap from '../editor/SkillMarkmap';
import QualityStars from '../shared/QualityStars';
import { FlaskConicalIcon, PlayIcon, SparklesIcon, FileCodeIcon, BotIcon } from '../shared/Icons';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export default function EvalsView() {
  const { tabs, activeTab, skills, settings, detectedAgents, setView } = useStore();
  const currentTab = tabs.find((t) => t.path === activeTab);
  const skill = skills.find((s) => s.path === activeTab);

  const [input, setInput]             = useState('');
  const [leftPaneMode, setLeftPaneMode] = useState<'markdown' | 'mindmap'>('markdown');
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [running, setRunning]         = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const noSkill = !currentTab;
  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);

  const handleRun = async () => {
    if (!input.trim() || running || !currentTab) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [
      ...m,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '', isLoading: true },
    ]);
    setRunning(true);

    try {
      const apiKey =
        activeProvider === 'gemini'
          ? settings.geminiApiKey
          : activeProvider === 'openai'
          ? settings.openaiApiKey
          : settings.claudeApiKey;

      const response = await window.deluluAPI.runEval({
        provider: activeProvider,
        skillContent: currentTab.content,
        userInput: userMsg,
        apiKey,
        model: settings.defaultModel,
        useLocalSession: settings.useLocalSession,
      });

      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1 ? { role: 'assistant', content: response } : msg
        )
      );
    } catch (e) {
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1 ? { role: 'assistant', content: `❌ ${String(e)}` } : msg
        )
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-base select-none animate-fade-in">
      {/* Left Pane: Skill Specification (Read-only context) */}
      <div
        className="flex flex-col border-r border-line overflow-hidden shrink-0"
        style={{ width: '48%' }}
      >
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-line bg-surface shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileCodeIcon size={14} className="text-accent shrink-0" />
            <span className="text-xs font-mono font-medium text-ink truncate max-w-36">
              {currentTab?.name ?? 'No skill'}
            </span>
            {skill && <QualityStars quality={skill.quality} size="sm" />}
          </div>

          <div className="flex items-center gap-1.5">
            {/* View toggle */}
            <div className="flex items-center bg-base p-0.5 rounded border border-line">
              <button
                type="button"
                onClick={() => setLeftPaneMode('markdown')}
                className={`px-1.5 py-0.5 rounded text-3xs font-mono transition-colors ${
                  leftPaneMode === 'markdown'
                    ? 'bg-surface-3 text-ink font-semibold border border-line-bright'
                    : 'text-ink-dim hover:text-ink-muted'
                }`}
              >
                Doc
              </button>
              <button
                type="button"
                onClick={() => setLeftPaneMode('mindmap')}
                className={`px-1.5 py-0.5 rounded text-3xs font-mono transition-colors ${
                  leftPaneMode === 'mindmap'
                    ? 'bg-surface-3 text-accent-bright font-semibold border border-line-bright'
                    : 'text-ink-dim hover:text-ink-muted'
                }`}
              >
                Mindmap
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {currentTab ? (
            leftPaneMode === 'markdown' ? (
              <MarkdownPreview content={currentTab.content} />
            ) : (
              <SkillMarkmap content={currentTab.content} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ink-dim gap-2 p-6 text-center">
              <FlaskConicalIcon size={32} className="opacity-20 mb-2" />
              <p className="text-xs font-medium text-ink-muted">No skill open for evaluation</p>
              <p className="text-3xs text-ink-dim max-w-xs">
                Open a skill file from the explorer sidebar to test and benchmark its behavior against LLMs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Conversational Test Runner */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Runner Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConicalIcon size={14} className="text-accent" />
            <span className="text-xs font-semibold text-ink font-sans">
              Evals Test Runner
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('agents')}
              className="flex items-center gap-1 text-3xs font-mono bg-surface-3 hover:bg-surface-4 border border-line text-accent-bright px-2 py-0.5 rounded transition-colors"
              title="Click to change active agent or model"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ok" />
              <span>{activeAgent?.name || activeProvider}: {settings.defaultModel}</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="btn-ghost text-3xs py-0.5 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5 select-text">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-ink-dim gap-2 select-none">
              <FlaskConicalIcon size={28} className="opacity-20 mb-1" />
              <p className="text-xs font-medium text-ink-muted">
                {noSkill ? 'Open a skill on the left to begin' : 'Ready to evaluate skill'}
              </p>
              {!noSkill && (
                <p className="text-3xs text-ink-dim text-center max-w-xs leading-relaxed">
                  Running on <span className="text-ink font-mono font-medium">{activeAgent?.name || activeProvider}</span>.
                  The active skill specification is loaded as the system prompt.
                </p>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <SparklesIcon size={12} />
                </div>
              )}
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-none shadow-sm'
                    : 'bg-surface-2 text-ink rounded-bl-none border border-line font-mono'
                }`}
              >
                {msg.isLoading ? (
                  <span className="flex items-center gap-1 text-ink-dim py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-bright animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </span>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Composer */}
        <div className="border-t border-line p-3 bg-surface shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRun();
                }
              }}
              placeholder={
                noSkill
                  ? 'Open a skill file first…'
                  : `Test ${currentTab?.name || 'skill'} with ${activeAgent?.name || 'Local Session'}…`
              }
              disabled={noSkill || running}
              rows={2}
              className="input flex-1 resize-none disabled:opacity-40 font-mono text-xs"
              style={{ minHeight: 56 }}
            />
            <button
              onClick={handleRun}
              disabled={noSkill || running || !input.trim()}
              className="btn-primary py-2 px-3.5 shrink-0"
            >
              <PlayIcon size={12} />
              <span>{running ? 'Running…' : 'Run'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
