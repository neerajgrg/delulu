import { useState } from 'react';
import { useStore } from '../../store/useStore';
import MonacoEditor from '../editor/MonacoEditor';
import MarkdownPreview from '../editor/MarkdownPreview';
import SkillMarkmap from '../editor/SkillMarkmap';
import VisualSkillEditor from '../editor/VisualSkillEditor';
import {
  FileCodeIcon,
  XIcon,
  PlusIcon,
  SparklesIcon,
  FlaskConicalIcon,
  FolderIcon,
  CheckIcon,
} from '../shared/Icons';
import { analyzeSkillTokens } from '../../lib/tokenCounter';
import ExportModal from '../modals/ExportModal';

type ViewMode = 'visual' | 'mindmap' | 'code';

export default function EditorView() {
  const {
    tabs,
    activeTab,
    closeTab,
    focusTab,
    updateContent,
    saveTab,
    setView,
    workspaceFolder,
    skills,
  } = useStore();

  const currentTab = tabs.find((t) => t.path === activeTab);
  const currentSkill = skills.find((s) => s.path === activeTab) || {
    name: currentTab?.name || 'untitled',
    path: currentTab?.path || '',
    source: 'workspace',
    quality: 4,
  };

  const isScriptFile = currentTab?.path?.match(/\.(py|ts|js|json|sh|yaml)$/i);
  const [viewMode, setViewMode] = useState<ViewMode>(isScriptFile ? 'code' : 'visual');
  const [showTips, setShowTips] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const folder = workspaceFolder?.split('/').pop() || 'workspace';

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base text-ink-dim select-none p-6 animate-fade-in">
        <FileCodeIcon size={44} className="opacity-20 mb-3 text-accent" />
        <h2 className="text-base font-semibold text-ink font-sans">No Skill or File Open</h2>
        <p className="text-xs text-ink-muted mt-1 max-w-sm text-center">
          Select a skill package from the sidebar or click below to create a new one.
        </p>
        <button
          onClick={() => setView('builder')}
          className="btn-primary text-xs mt-4 py-2 px-4 shadow-sm"
        >
          <PlusIcon size={14} />
          <span>New Skill</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base select-none animate-fade-in font-sans">
      {/* ── Top Tabs & Controls Bar ── */}
      <div className="flex items-center justify-between bg-surface border-b border-line px-3 py-1.5 shrink-0 select-none">
        {/* Open Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.path === activeTab;
            return (
              <div
                key={tab.path}
                onClick={() => focusTab(tab.path)}
                className={`
                  group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
                  ${isActive
                    ? 'bg-surface-3 text-ink font-semibold shadow-sm border border-line-bright'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-2'}
                `}
              >
                <FileCodeIcon
                  size={14}
                  className={isActive ? 'text-accent-bright' : 'text-ink-dim'}
                />
                <span className="truncate max-w-40">{tab.name}</span>

                {tab.isDirty ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"
                    title="Unsaved changes (⌘S)"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.path);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-err text-ink-dim transition-opacity p-0.5 rounded"
                    title="Close tab (Cmd+W)"
                  >
                    <XIcon size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Toolbar: View Switcher & Action Buttons */}
        {currentTab && (
          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Segmented Control */}
            <div className="flex items-center bg-base p-0.5 rounded-lg border border-line shadow-inner">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'visual'
                    ? 'bg-surface-3 text-ink font-semibold shadow-sm border border-line-bright'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Simple Visual Form View"
              >
                ✏️ Visual Form
              </button>

              <button
                onClick={() => setViewMode('mindmap')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'mindmap'
                    ? 'bg-surface-3 text-accent-bright font-semibold shadow-sm border border-line-bright'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Interactive Mindmap View"
              >
                <SparklesIcon size={12} />
                <span>Mindmap</span>
              </button>

              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'code'
                    ? 'bg-surface-3 text-ink font-semibold shadow-sm border border-line-bright'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="Raw Code / Markdown Editor"
              >
                💻 Code
              </button>
            </div>

            {/* Live Token Budget Indicator */}
            {currentTab && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-line text-xs text-ink-muted font-mono"
                title={`Skill Token Count: ~${analyzeSkillTokens(currentTab.content).totalTokens.toLocaleString()} tokens\nBudget: ${analyzeSkillTokens(currentTab.content).contextPercentage}% of 128k context\nEstimated Cost/1k calls: $${analyzeSkillTokens(currentTab.content).estimatedCostPer1kCalls}`}
              >
                <span className="text-amber-400">⚡</span>
                <span className="font-semibold text-ink">
                  {analyzeSkillTokens(currentTab.content).totalTokens.toLocaleString()}
                </span>
                <span className="text-[10px] text-ink-dim">tok</span>
              </div>
            )}

            <div className="h-4 w-px bg-line" />

            {/* Export & Share Action */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="btn-outline py-1 px-2.5 text-xs flex items-center gap-1.5 text-ink-muted hover:text-ink"
              title="Export as MCP Tool JSON, OpenAI Schema, TS, or Python"
            >
              <FileCodeIcon size={12} />
              <span>Export…</span>
            </button>

            {/* AI Tips Dropdown Trigger */}
            <button
              onClick={() => setShowTips(!showTips)}
              className={`btn-outline py-1 px-2.5 text-xs flex items-center gap-1.5 ${
                showTips ? 'border-accent text-accent-bright bg-accent/10' : ''
              }`}
            >
              <SparklesIcon size={12} className="text-accent-bright" />
              <span>AI Tips</span>
            </button>

            {/* Evals Action */}
            <button
              onClick={() => setView('evals')}
              className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5 shadow-sm"
              title="Test Skill in Evals Studio (⌘3)"
            >
              <FlaskConicalIcon size={12} />
              <span>Test Skill</span>
            </button>
          </div>
        )}
      </div>

      {/* Export & Distribute Modal */}
      {currentTab && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          skillName={currentSkill.name}
          content={currentTab.content}
        />
      )}

      {/* ── AI Tips Floating Flyout ── */}
      {showTips && currentTab && (
        <div className="bg-surface-2 border-b border-line px-6 py-3 flex items-center justify-between gap-4 text-xs animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse shrink-0" />
            <div>
              <span className="font-semibold text-ink mr-2">✦ AI Recommendation:</span>
              <span className="text-ink-2">
                Few-shot examples and explicit negative guardrails significantly increase accuracy across local LLMs.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowTips(false)}
            className="text-ink-dim hover:text-ink p-1 rounded"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* ── Main View Body ── */}
      {currentTab && (
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'visual' && !isScriptFile ? (
            /* 1. Visual Form Mode (Intuitive No-Code) */
            <VisualSkillEditor
              skill={currentSkill as any}
              content={currentTab.content}
              onChange={(newVal) => updateContent(currentTab.path, newVal)}
              onSave={() => saveTab(currentTab.path)}
              onRunEvals={() => setView('evals')}
            />
          ) : viewMode === 'mindmap' && !isScriptFile ? (
            /* 2. Interactive Mindmap Mode */
            <div className="w-full h-full flex flex-col">
              <SkillMarkmap content={currentTab.content} />
            </div>
          ) : (
            /* 3. Code Editor Mode (Side-by-Side Monaco + Preview) */
            <div className="flex-1 h-full flex overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <MonacoEditor
                  filePath={currentTab.path}
                  value={currentTab.content}
                  onChange={(v) => updateContent(currentTab.path, v ?? '')}
                  onSave={() => saveTab(currentTab.path)}
                />
              </div>

              {!isScriptFile && (
                <>
                  <div className="w-px bg-line shrink-0" />
                  <div className="flex-1 overflow-hidden bg-base">
                    <MarkdownPreview content={currentTab.content} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
