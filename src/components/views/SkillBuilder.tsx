import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { SKILL_TEMPLATES } from '../../lib/skillTemplateCatalog';
import { generateSkillMarkdown } from '../../lib/skillMarkdown';
import {
  SparklesIcon,
  PlusIcon,
  BotIcon,
  CheckIcon,
  FolderIcon,
} from '../shared/Icons';
import type { BuilderState } from '../../types/delulu';

export default function SkillBuilder() {
  const {
    refreshSkills,
    openSkill,
    workspaceFolder,
    setView,
  } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folderName = workspaceFolder ? workspaceFolder.split('/').pop() : 'workspace';

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    const tpl = SKILL_TEMPLATES.find((t) => t.id === tplId);
    if (tpl && tpl.id !== 'blank') {
      if (!name) setName(tpl.id);
      if (!description) setDescription(tpl.description);
    }
  };

  // Instant 1-Click AI Generation
  const handleQuickAiFill = async () => {
    if (!description.trim() && !name.trim()) return;
    setIsAiGenerating(true);
    setError(null);
    try {
      const promptText = description.trim() || name.trim();
      const slug = (name.trim() || promptText)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 30);

      setName(slug);
      if (!description) {
        setDescription(`Autonomous agent skill to ${promptText}.`);
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a skill name.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const tpl = SKILL_TEMPLATES.find((t) => t.id === selectedTemplate);
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      const trigger = cleanName.split(/[-_]/)[0] || 'run';

      const state: BuilderState = {
        name: cleanName,
        description: description.trim() || tpl?.description || 'Autonomous skill definition.',
        trigger: tpl?.trigger || trigger,
        tags: tpl?.tags || [trigger, 'skill'],
        templateId: selectedTemplate,
        examples: tpl?.exampleContent || `### Example 1\n**Input:**\nExecute ${cleanName}\n\n**Output:**\n[Task completed successfully]`,
        constraints: tpl?.constraintContent || `- Validate user inputs.\n- Never reveal API credentials or secrets.`,
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 2048,
      };

      const markdown = generateSkillMarkdown(state);
      const dir = workspaceFolder || '';
      const filePath = await window.deluluAPI.createFile(dir, cleanName, markdown);
      await refreshSkills();
      const updatedSkills = await window.deluluAPI.scanSkills(workspaceFolder || undefined);

      const created = updatedSkills.find((s) => s.path === filePath) || {
        path: filePath,
        name: cleanName,
        description: state.description,
        tags: state.tags,
        trigger: state.trigger,
        source: 'workspace' as const,
        quality: 4,
        mtime: Date.now(),
      };

      await openSkill(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create skill.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#18181c] text-[#cccccc] p-6 select-none font-sans overflow-y-auto">
      <div className="w-full max-w-xl flex flex-col gap-6 bg-[#1e1e24] p-8 rounded-2xl border border-[#2e2e38] shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2e2e38] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#007acc] text-white shadow-sm">
              <PlusIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                New Skill
              </h1>
              <p className="text-xs text-[#858591] mt-0.5">
                Quickly create a skill file. You can refine examples and rules later in the editor.
              </p>
            </div>
          </div>

          <button
            onClick={() => setView('welcome')}
            className="text-[#858591] hover:text-white text-xs px-2 py-1 rounded hover:bg-[#282832] transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Quick Starter Templates */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#858591] font-mono">
            Starter Template
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_TEMPLATES.map((tpl) => {
              const selected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`
                    flex items-center gap-2 p-2.5 rounded-lg text-left transition-all border cursor-pointer
                    ${selected
                      ? 'bg-[#24242d] border-[#007acc] text-white shadow-sm'
                      : 'bg-[#18181c] border-[#2e2e38] text-[#858591] hover:text-white hover:border-[#444452]'}
                  `}
                >
                  <span className="text-base">{tpl.icon}</span>
                  <span className="text-xs font-medium truncate flex-1">{tpl.name}</span>
                  {selected && <CheckIcon size={12} className="text-[#3794ff] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {/* Skill Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#858591] font-mono">
              Skill Name *
            </label>
            <div className="flex items-center px-3 py-2 rounded-lg bg-[#18181c] border border-[#2e2e38] focus-within:border-[#007acc] transition-all">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. weather-api-helper, code-review"
                className="bg-transparent text-white text-xs outline-none w-full font-mono selectable"
              />
              <span className="text-[11px] text-[#858591] font-mono shrink-0">.skill.md</span>
            </div>
          </div>

          {/* Short Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#858591] font-mono">
                What does it do? (Description)
              </label>
              <button
                type="button"
                onClick={handleQuickAiFill}
                disabled={isAiGenerating || (!name && !description)}
                className="text-[11px] text-[#3794ff] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <SparklesIcon size={11} />
                <span>Auto-fill with AI</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fetch live weather forecasts and transform radar responses..."
              className="w-full p-3 rounded-lg bg-[#18181c] border border-[#2e2e38] text-white text-xs outline-none focus:border-[#007acc] transition-all resize-none selectable"
            />
          </div>

          {/* Location info */}
          <div className="flex items-center gap-2 text-xs text-[#858591] px-1">
            <FolderIcon size={13} className="text-[#007acc]" />
            <span>Will be created in:</span>
            <span className="font-mono text-white text-[11px]">{folderName}/</span>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-2.5 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2e38] mt-2">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="px-4 py-2 rounded-lg border border-[#2e2e38] bg-[#24242d] hover:bg-[#2c2c36] text-white text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="px-6 py-2 rounded-lg bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40"
            >
              <PlusIcon size={14} />
              <span>{creating ? 'Creating…' : 'Create & Open Skill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
