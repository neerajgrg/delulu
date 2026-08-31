import React, { useState, useMemo } from 'react';
import { analyzeSkillContent, type SkillRecommendation } from '../../lib/skillLinter';
import { useStore } from '../../store/useStore';
import {
  SparklesIcon,
  CheckIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
} from '../shared/Icons';

interface InlineAgentRecommendationsProps {
  content: string;
  onApplyPatch: (newContent: string) => void;
}

const InlineAgentRecommendations: React.FC<InlineAgentRecommendationsProps> = ({
  content,
  onApplyPatch,
}) => {
  const { settings, detectedAgents } = useStore();
  const [expanded, setExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPromptBar, setShowPromptBar] = useState(false);

  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);

  const recommendations = useMemo(() => {
    return analyzeSkillContent(content).filter((r) => !dismissedIds.includes(r.id));
  }, [content, dismissedIds]);

  const handleApply = (rec: SkillRecommendation) => {
    const updated = rec.applyPatch(content);
    onApplyPatch(updated);
    setDismissedIds((prev) => [...prev, rec.id]);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleAiRefactor = async () => {
    if (!customPrompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const apiKey =
        activeProvider === 'gemini'
          ? settings.geminiApiKey
          : activeProvider === 'openai'
          ? settings.openaiApiKey
          : settings.claudeApiKey;

      const systemInstructions =
        'You are an expert AI Skill Engineer. Your task is to refactor and improve the provided skill file according to the user request. Return ONLY the raw markdown content of the updated skill file, with valid YAML frontmatter, without conversational preamble or code fences around the whole file.';

      const result = await window.deluluAPI.runEval({
        provider: activeProvider,
        skillContent: systemInstructions,
        userInput: `User request: ${customPrompt}\n\nCurrent Skill Content:\n${content}`,
        apiKey,
        model: settings.defaultModel,
        useLocalSession: settings.useLocalSession,
      });

      // If valid markdown was returned, strip any markdown outer fences if present
      let cleanResult = result.trim();
      if (cleanResult.startsWith('```markdown') && cleanResult.endsWith('```')) {
        cleanResult = cleanResult.replace(/^```markdown\r?\n/, '').replace(/\r?\n```$/, '');
      } else if (cleanResult.startsWith('```') && cleanResult.endsWith('```')) {
        cleanResult = cleanResult.replace(/^```\r?\n/, '').replace(/\r?\n```$/, '');
      }

      if (cleanResult.includes('---')) {
        onApplyPatch(cleanResult);
        setCustomPrompt('');
        setShowPromptBar(false);
      }
    } catch {
      // ignore
    } finally {
      setIsEnhancing(false);
    }
  };

  if (recommendations.length === 0 && !showPromptBar) {
    return (
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-t border-line text-3xs font-mono text-ink-dim select-none">
        <div className="flex items-center gap-1.5 text-ok">
          <CheckIcon size={12} />
          <span>Skill Quality: Optimal · All checks passed</span>
        </div>
        <button
          onClick={() => setShowPromptBar(true)}
          className="btn-ghost text-3xs py-0.5 px-1.5 text-accent-bright hover:text-white"
        >
          <SparklesIcon size={10} />
          <span>Ask AI to Refactor…</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-line bg-surface select-none flex flex-col shrink-0 animate-slide-up shadow-md">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-line">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left hover:text-accent-bright transition-colors"
        >
          <span className="text-ink-dim">
            {expanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
          </span>
          <div className="flex items-center gap-1.5">
            <SparklesIcon size={13} className="text-accent" />
            <span className="text-xs font-semibold text-ink font-sans tracking-tight">
              Agent Recommendations
            </span>
            <span className="text-3xs font-mono bg-surface-3 border border-line text-accent-bright px-1.5 py-0.2 rounded font-medium">
              {recommendations.length} available
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptBar((v) => !v)}
            className={`btn-outline text-3xs py-0.5 px-2 ${showPromptBar ? 'border-accent text-accent-bright' : ''}`}
          >
            <SparklesIcon size={11} />
            <span>AI Refactor</span>
          </button>
          <span className="text-3xs font-mono text-ink-dim">
            via {activeAgent?.name || 'Local Agent'}
          </span>
        </div>
      </div>

      {/* Expanded Content Drawer */}
      {expanded && (
        <div className="flex flex-col gap-2 p-3 max-h-48 overflow-y-auto bg-base/60">
          {/* Custom AI Refactor Prompt Bar */}
          {showPromptBar && (
            <div className="p-2.5 rounded-lg bg-surface-2 border border-accent/40 flex flex-col gap-2 mb-1 shadow-glow-sm">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono uppercase tracking-wider text-accent-bright font-semibold flex items-center gap-1">
                  <SparklesIcon size={11} />
                  <span>Interactive AI Skill Refactoring</span>
                </span>
                <button
                  onClick={() => setShowPromptBar(false)}
                  className="text-ink-dim hover:text-ink"
                >
                  <XIcon size={11} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiRefactor()}
                  placeholder="e.g. Add 3 Python and TypeScript examples, add strict boundary rules…"
                  className="input text-xs flex-1 py-1"
                />
                <button
                  onClick={handleAiRefactor}
                  disabled={isEnhancing || !customPrompt.trim()}
                  className="btn-primary text-xs py-1 px-3 shrink-0"
                >
                  <PlayIcon size={10} />
                  <span>{isEnhancing ? 'Refactoring…' : 'Apply'}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Dynamic Recommendations */}
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface border border-line hover:border-line-bright transition-all"
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <span
                  className={`inline-flex items-center text-3xs font-mono px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wider font-semibold mt-0.5 ${
                    rec.severity === 'warning'
                      ? 'bg-warn/15 text-warn border border-warn/30'
                      : rec.severity === 'tip'
                      ? 'bg-accent/15 text-accent-bright border border-accent/30'
                      : 'bg-info/15 text-info border border-info/30'
                  }`}
                >
                  {rec.severity}
                </span>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-ink font-sans tracking-tight truncate">
                    {rec.title}
                  </h4>
                  <p className="text-3xs text-ink-muted leading-tight truncate">
                    {rec.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleApply(rec)}
                  className="btn-primary text-3xs py-1 px-2.5 shadow-sm"
                  title="Apply recommendation directly into editor"
                >
                  <SparklesIcon size={10} />
                  <span>{rec.actionLabel}</span>
                </button>
                <button
                  onClick={() => handleDismiss(rec.id)}
                  className="btn-ghost text-3xs p-1 text-ink-dim hover:text-ink"
                  title="Dismiss"
                >
                  <XIcon size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineAgentRecommendations;
