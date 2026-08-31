import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  BookOpenIcon,
  SparklesIcon,
  FlaskConicalIcon,
  PlusIcon,
  LibraryIcon,
  CheckIcon,
  BotIcon,
} from '../shared/Icons';

export default function DocsView() {
  const { setView } = useStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'standard' | 'tokens' | 'agents' | 'contributing'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex h-full bg-base overflow-hidden font-sans select-none animate-fade-in">
      {/* ── Left Docs Sidebar ── */}
      <div className="w-64 border-r border-line bg-surface flex flex-col p-4 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 px-2">
          <BookOpenIcon size={18} className="text-accent-bright" />
          <span className="font-bold text-sm text-ink tracking-tight">Developer Docs</span>
          <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent-bright font-semibold">v0.1.0</span>
        </div>

        <div className="space-y-1 text-xs">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-between ${
              activeSection === 'overview'
                ? 'bg-surface-3 text-ink font-semibold border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2'
            }`}
          >
            <span>Overview & Philosophy</span>
            <span>✦</span>
          </button>

          <button
            onClick={() => setActiveSection('standard')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-between ${
              activeSection === 'standard'
                ? 'bg-surface-3 text-ink font-semibold border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2'
            }`}
          >
            <span>Universal .skill.md Spec</span>
            <span>📄</span>
          </button>

          <button
            onClick={() => setActiveSection('tokens')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-between ${
              activeSection === 'tokens'
                ? 'bg-surface-3 text-ink font-semibold border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2'
            }`}
          >
            <span>Token Budgeting Engine</span>
            <span>⚡</span>
          </button>

          <button
            onClick={() => setActiveSection('agents')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-between ${
              activeSection === 'agents'
                ? 'bg-surface-3 text-ink font-semibold border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2'
            }`}
          >
            <span>Multi-Agent Symlinks</span>
            <span>🔗</span>
          </button>

          <button
            onClick={() => setActiveSection('contributing')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-between ${
              activeSection === 'contributing'
                ? 'bg-surface-3 text-ink font-semibold border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2'
            }`}
          >
            <span>Contributing Guide</span>
            <span>🤝</span>
          </button>
        </div>

        {/* Quick Launch CTA */}
        <div className="mt-auto pt-6 border-t border-line">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-line space-y-2.5">
            <span className="text-2xs font-semibold text-accent-bright uppercase tracking-wider">Live IDE Studio</span>
            <p className="text-3xs text-ink-muted">Ready to author a new skill or run live evals?</p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setView('builder')}
                className="btn-primary text-3xs py-1.5 px-2.5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PlusIcon size={12} />
                <span>Create Skill</span>
              </button>
              <button
                onClick={() => setView('evals')}
                className="btn-outline text-3xs py-1.5 px-2.5 flex items-center justify-center gap-1.5"
              >
                <FlaskConicalIcon size={12} />
                <span>Test in Playground</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 h-full overflow-y-auto p-8 md:p-12 select-text">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                  Getting Started
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-2">
                  Delulu AI Skill Studio Architecture
                </h1>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                  Delulu is a specialized developer studio for authoring, evaluating, and deploying reusable skill packages across Claude, Gemini, Cursor, and Ollama agent runtimes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <div className="text-accent-bright font-semibold text-xs">🎯 Central Vault</div>
                  <p className="text-3xs text-ink-muted">Skills reside in <code className="font-mono text-ink">~/.delulu/skills</code> and auto-symlink across agents.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <div className="text-amber-400 font-semibold text-xs">⚡ Live Token Budgeting</div>
                  <p className="text-3xs text-ink-muted">Live BPE token counter keeps prompt size under budget.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <div className="text-emerald-400 font-semibold text-xs">🧪 AI Benchmark Runner</div>
                  <p className="text-3xs text-ink-muted">Test prompts live against local Ollama or cloud models.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-3">
                <h3 className="text-xs font-semibold text-ink">Quick Navigation</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setView('editor')} className="btn-outline text-xs py-1 px-3">Open Editor</button>
                  <button onClick={() => setView('evals')} className="btn-outline text-xs py-1 px-3">Open AI Playground</button>
                  <button onClick={() => setView('gallery')} className="btn-outline text-xs py-1 px-3">Browse Templates</button>
                  <button onClick={() => setView('settings')} className="btn-outline text-xs py-1 px-3">Agent Settings</button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Standard */}
          {activeSection === 'standard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                  Specification
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-2">
                  Universal Skill Format (<code className="font-mono text-accent-bright text-xl">.skill.md</code>)
                </h1>
                <p className="text-sm text-ink-muted mt-2">
                  Standardized Markdown with YAML frontmatter natively compatible with Claude Code, Cursor, and Gemini agents.
                </p>
              </div>

              <div className="relative rounded-xl bg-surface border border-line p-4 font-mono text-xs overflow-x-auto text-ink">
                <button
                  onClick={() => copyToClipboard(`---\nname: code-review\ndescription: "Inspect code quality."\ntrigger: "review"\ntags: [code, review]\nmodel: claude-3-5-sonnet-20241022\ntemperature: 0.7\nmax_tokens: 2048\n---\n\n# Code Review\n\n## Description\nComprehensive code quality and security inspection agent skill.\n\n## Examples\n### Example 1\n**Input:**\n\`\`\`ts\nfunction add(a, b) { return a + b; }\n\`\`\`\n\n**Output:**\n- ⚠️ Missing TypeScript type annotations.\n\n## Constraints\n- Always provide actionable diffs.`, 'spec-code')}
                  className="absolute top-3 right-3 btn-outline text-3xs py-1 px-2 flex items-center gap-1"
                >
                  {copiedId === 'spec-code' ? <CheckIcon size={10} className="text-ok" /> : <span>Copy</span>}
                </button>
                <pre>{`---
name: code-review
description: "Inspect code for quality, edge cases, and style improvements."
trigger: "review"
tags: [code, review, quality]
model: claude-3-5-sonnet-20241022
temperature: 0.7
max_tokens: 2048
---

# Code Review

## Description
Comprehensive code quality and security inspection agent skill.

## Examples
### Example 1
**Input:**
\`\`\`typescript
function add(a, b) { return a + b; }
\`\`\`

**Output:**
- ⚠️ Missing TypeScript type annotations for parameters \`a\` and \`b\`.
- ⚠️ Return type not declared — inferred as \`any\`.
- ✅ Logic is correct for numeric addition.

## Constraints
- Always provide actionable code diffs.
- Never output raw API keys or credentials.`}</pre>
              </div>
            </div>
          )}

          {/* Section: Tokens */}
          {activeSection === 'tokens' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                  Optimization
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-2">
                  Token Budgeting & Context Window Management
                </h1>
                <p className="text-sm text-ink-muted mt-2">
                  Delulu computes real-time BPE token counts and context budget percentages to prevent prompt bloat.
                </p>
              </div>

              <div className="space-y-4 text-xs text-ink-muted leading-relaxed">
                <div className="p-4 rounded-xl bg-surface border border-line">
                  <h3 className="text-sm font-semibold text-ink mb-1">⚡ Estimation Algorithm</h3>
                  <p>Accounts for code blocks (~3.2 chars/token) and prose (~4.0 chars/token) with structural prompt framing tokens.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line">
                  <h3 className="text-sm font-semibold text-ink mb-1">📊 Context Window %</h3>
                  <p>Shows percentage against 128k context window to ensure prompt fits easily in the agent budget.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Agents */}
          {activeSection === 'agents' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                  Distribution
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-2">
                  Multi-Agent Symlinks & Sync
                </h1>
                <p className="text-sm text-ink-muted mt-2">
                  One master skill file symlinked automatically across all local agent toolchains.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-surface border border-line flex items-center justify-between">
                  <span>~/.claude/skills/code-review.skill.md</span>
                  <span className="text-accent-bright">→ ~/.delulu/skills/</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-line flex items-center justify-between">
                  <span>.cursor/skills/code-review.skill.md</span>
                  <span className="text-accent-bright">→ ~/.delulu/skills/</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-line flex items-center justify-between">
                  <span>~/.gemini/skills/code-review.skill.md</span>
                  <span className="text-accent-bright">→ ~/.delulu/skills/</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Contributing */}
          {activeSection === 'contributing' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                  Open Source
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mt-2">
                  Contributing to Delulu
                </h1>
                <p className="text-sm text-ink-muted mt-2">
                  Contributions are welcome! Follow standard GitHub flow:
                </p>
              </div>

              <div className="space-y-3 text-xs text-ink-muted font-mono">
                <div className="p-3.5 rounded-xl bg-surface border border-line space-y-1">
                  <div className="text-ink font-semibold font-sans text-sm">1. Fork & Branch</div>
                  <div>git checkout -b feat/my-feature</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-line space-y-1">
                  <div className="text-ink font-semibold font-sans text-sm">2. Typecheck & Build</div>
                  <div>npm run typecheck && npm run build:vite</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-line space-y-1">
                  <div className="text-ink font-semibold font-sans text-sm">3. Open Pull Request</div>
                  <div>git push origin feat/my-feature</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
