import React, { useState, useEffect } from 'react';
import type { SkillFile } from '../../types/delulu';
import QualityStars from '../shared/QualityStars';
import {
  SparklesIcon,
  PlusIcon,
  XIcon,
  BotIcon,
  CheckIcon,
  FlaskConicalIcon,
} from '../shared/Icons';

interface VisualSkillEditorProps {
  skill: SkillFile;
  content: string;
  onChange: (newContent: string) => void;
  onSave?: () => void;
  onRunEvals?: () => void;
}

interface ParsedSkill {
  name: string;
  description: string;
  trigger: string;
  tags: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  examples: Array<{ input: string; output: string }>;
  constraints: string[];
  rawBody: string;
}

/**
 * Parses markdown + YAML frontmatter into a structured visual object.
 */
function parseSkillToVisual(raw: string, fallbackName: string): ParsedSkill {
  const result: ParsedSkill = {
    name: fallbackName,
    description: '',
    trigger: '',
    tags: [],
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2048,
    examples: [],
    constraints: [],
    rawBody: '',
  };

  if (!raw) return result;

  // Extract YAML frontmatter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let body = raw;

  if (fmMatch) {
    const yaml = fmMatch[1];
    body = fmMatch[2];

    const lines = yaml.split('\n');
    for (const line of lines) {
      const colIdx = line.indexOf(':');
      if (colIdx === -1) continue;
      const key = line.slice(0, colIdx).trim();
      const val = line.slice(colIdx + 1).trim().replace(/^["']|["']$/g, '');

      if (key === 'name') result.name = val;
      else if (key === 'description') result.description = val;
      else if (key === 'trigger') result.trigger = val;
      else if (key === 'model') result.model = val;
      else if (key === 'temperature') result.temperature = parseFloat(val) || 0.7;
      else if (key === 'max_tokens') result.maxTokens = parseInt(val, 10) || 2048;
      else if (key === 'tags') {
        const cleaned = val.replace(/^\[|\]$/g, '');
        result.tags = cleaned.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
  }

  result.rawBody = body;

  // Extract Constraints
  const constraintsMatch = body.match(/## Constraints\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (constraintsMatch) {
    const items = constraintsMatch[1]
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter((l) => l.length > 0);
    result.constraints = items;
  }

  // Extract Examples
  const examplesMatch = body.match(/## Examples\s*\n([\s\S]*?)(?=\n## Constraints|\n## Configuration|$)/i);
  if (examplesMatch) {
    const exText = examplesMatch[1];
    // Split by Example headings
    const exSections = exText.split(/###\s*Example\s*\d*/i).filter((s) => s.trim().length > 0);
    if (exSections.length > 0) {
      result.examples = exSections.map((sec) => {
        const inMatch = sec.match(/\*\*Input:\*\*\s*([\s\S]*?)(?=\*\*Output:\*\*|$)/i);
        const outMatch = sec.match(/\*\*Output:\*\*\s*([\s\S]*)/i);
        return {
          input: inMatch ? inMatch[1].trim() : sec.trim(),
          output: outMatch ? outMatch[1].trim() : '',
        };
      });
    } else {
      result.examples = [{ input: exText.trim(), output: '' }];
    }
  }

  return result;
}

/**
 * Re-serializes visual data back into clean, standard .skill.md content.
 */
function serializeVisualToSkill(data: ParsedSkill): string {
  const tagsFormatted = data.tags.length > 0 ? `[${data.tags.join(', ')}]` : '[]';

  let md = `---
name: ${data.name || 'untitled-skill'}
description: "${data.description.replace(/"/g, '\\"')}"
trigger: "${data.trigger}"
tags: ${tagsFormatted}
model: ${data.model}
temperature: ${data.temperature}
max_tokens: ${data.maxTokens}
---

# ${data.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}

## Description
${data.description || 'Describe what this skill does.'}

## Examples
`;

  if (data.examples.length > 0) {
    data.examples.forEach((ex, idx) => {
      md += `### Example ${idx + 1}\n**Input:**\n${ex.input}\n\n**Output:**\n${ex.output || 'Result format'}\n\n`;
    });
  } else {
    md += `Provide concrete input/output examples here.\n\n`;
  }

  md += `## Constraints\n`;
  if (data.constraints.length > 0) {
    data.constraints.forEach((c) => {
      md += `- ${c}\n`;
    });
  } else {
    md += `- Do not perform dangerous operations without confirmation.\n`;
  }

  md += `\n## Configuration\n- **Model**: \`${data.model}\`\n- **Temperature**: \`${data.temperature}\`\n- **Max Tokens**: \`${data.maxTokens}\`\n`;

  return md;
}

export const VisualSkillEditor: React.FC<VisualSkillEditorProps> = ({
  skill,
  content,
  onChange,
  onSave,
  onRunEvals,
}) => {
  const [data, setData] = useState<ParsedSkill>(() =>
    parseSkillToVisual(content, skill.name)
  );
  const [newTag, setNewTag] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  // Sync state when external content changes
  useEffect(() => {
    setData(parseSkillToVisual(content, skill.name));
  }, [content, skill.name]);

  const updateData = (updater: (prev: ParsedSkill) => ParsedSkill) => {
    const updated = updater(data);
    setData(updated);
    const newMarkdown = serializeVisualToSkill(updated);
    onChange(newMarkdown);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tag = newTag.trim().toLowerCase();
      if (!data.tags.includes(tag)) {
        updateData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleAddConstraint = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newConstraint.trim()) {
      e.preventDefault();
      updateData((prev) => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()],
      }));
      setNewConstraint('');
    }
  };

  const handleRemoveConstraint = (index: number) => {
    updateData((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  };

  const handleAddExample = () => {
    updateData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          input: 'User prompt or input data...',
          output: 'Expected output format or structured response...',
        },
      ],
    }));
  };

  const handleUpdateExample = (
    index: number,
    field: 'input' | 'output',
    value: string
  ) => {
    updateData((prev) => {
      const copy = [...prev.examples];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, examples: copy };
    });
  };

  const handleRemoveExample = (index: number) => {
    updateData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-base p-6 md:p-10 font-sans select-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Top Header Card */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-line">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent-bright font-semibold border border-accent/30">
                AI Skill
              </span>
              <QualityStars quality={skill.quality} size="md" />
              <span className="text-xs text-ink-muted">Quality: {skill.quality}/5</span>
            </div>

            <input
              type="text"
              value={data.name}
              onChange={(e) =>
                updateData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Skill Name (e.g. code-review)"
              className="text-2xl md:text-3xl font-bold text-ink bg-transparent outline-none w-full placeholder-ink-dim"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRunEvals && (
              <button
                onClick={onRunEvals}
                className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FlaskConicalIcon size={14} />
                <span>Test Skill</span>
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="btn-outline py-2 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckIcon size={14} />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Description & Trigger */}
        <div className="p-5 rounded-xl border border-line bg-surface flex flex-col gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
              What does this skill do? (Description)
            </label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) =>
                updateData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe clearly when and how AI agents should use this skill..."
              className="w-full p-3 rounded-lg border border-line bg-base text-ink placeholder-ink-dim text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none selectable"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
                Slash Trigger Keyword
              </label>
              <div className="flex items-center rounded-lg border border-line bg-base px-3 py-2 text-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <span className="text-ink-dim font-mono mr-1">/</span>
                <input
                  type="text"
                  value={data.trigger}
                  onChange={(e) =>
                    updateData((prev) => ({ ...prev, trigger: e.target.value }))
                  }
                  placeholder="review"
                  className="bg-transparent text-ink placeholder-ink-dim outline-none w-full selectable"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
                Tags & Keywords
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg border border-line bg-base min-h-[42px]">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-3 text-ink-2 text-xs font-mono border border-line"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-err text-ink-dim ml-0.5"
                    >
                      <XIcon size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Enter)…"
                  className="bg-transparent text-xs text-ink placeholder-ink-dim outline-none px-1.5 py-1 min-w-[100px] flex-1 selectable"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Conversational Input / Output Examples */}
        <div className="p-5 rounded-xl border border-line bg-surface flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink font-sans">
                Few-Shot Examples (Input ➔ Output)
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Concrete examples teach AI agents the exact format and behavior you expect.
              </p>
            </div>

            <button
              onClick={handleAddExample}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <PlusIcon size={13} />
              <span>Add Example</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-1">
            {data.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-line bg-base flex flex-col gap-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-accent-bright">
                    Example #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveExample(idx)}
                    className="opacity-0 group-hover:opacity-100 text-ink-dim hover:text-err transition-opacity p-1"
                    title="Delete example"
                  >
                    <XIcon size={13} />
                  </button>
                </div>

                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-ink-dim mb-1 font-mono">
                    User Input / Prompt:
                  </label>
                  <textarea
                    rows={2}
                    value={ex.input}
                    onChange={(e) =>
                      handleUpdateExample(idx, 'input', e.target.value)
                    }
                    placeholder="e.g. Audit the login form for color contrast and ARIA labels"
                    className="w-full p-2.5 rounded-md border border-line bg-surface text-ink text-xs outline-none focus:border-accent resize-none selectable"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-ink-dim mb-1 font-mono">
                    Expected Agent Output:
                  </label>
                  <textarea
                    rows={3}
                    value={ex.output}
                    onChange={(e) =>
                      handleUpdateExample(idx, 'output', e.target.value)
                    }
                    placeholder="e.g. [PASS] Contrast 4.5:1, [WARN] Missing aria-label on submit button"
                    className="w-full p-2.5 rounded-md border border-line bg-surface text-ink font-mono text-xs outline-none focus:border-accent resize-none selectable"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Guardrails & Safety Constraints */}
        <div className="p-5 rounded-xl border border-line bg-surface flex flex-col gap-3 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-ink font-sans">
              Guardrails & Constraints
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Rules and negative constraints the agent MUST follow (e.g. "Never delete files without user confirmation").
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {data.constraints.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-line bg-base text-xs text-ink group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate">{c}</span>
                </div>
                <button
                  onClick={() => handleRemoveConstraint(idx)}
                  className="opacity-0 group-hover:opacity-100 text-ink-dim hover:text-err p-1 transition-opacity shrink-0"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                onKeyDown={handleAddConstraint}
                placeholder="+ Add constraint (e.g. 'Never include API keys in output') and press Enter…"
                className="flex-1 p-2.5 rounded-lg border border-line bg-base text-ink placeholder-ink-dim text-xs outline-none focus:border-accent selectable"
              />
            </div>
          </div>
        </div>

        {/* 4. Target Model Configuration */}
        <div className="p-5 rounded-xl border border-line bg-surface flex flex-col gap-4 shadow-sm mb-8">
          <div>
            <h2 className="text-sm font-semibold text-ink font-sans">
              AI Model & Runtime Settings
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Default LLM model, temperature, and token parameters for this skill.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
                Model
              </label>
              <select
                value={data.model}
                onChange={(e) =>
                  updateData((prev) => ({ ...prev, model: e.target.value }))
                }
                className="w-full p-2.5 rounded-lg border border-line bg-base text-ink text-xs outline-none focus:border-accent cursor-pointer"
              >
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                <option value="claude-opus-4-5">Claude 3.5 Opus</option>
                <option value="gemma3:1b">Ollama (gemma3:1b)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
                Temperature ({data.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={data.temperature}
                onChange={(e) =>
                  updateData((prev) => ({
                    ...prev,
                    temperature: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-accent cursor-pointer mt-2"
              />
              <div className="flex justify-between text-3xs text-ink-dim font-mono mt-1">
                <span>0.0 (Precise)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-dim mb-1.5 font-mono">
                Max Tokens
              </label>
              <input
                type="number"
                value={data.maxTokens}
                onChange={(e) =>
                  updateData((prev) => ({
                    ...prev,
                    maxTokens: parseInt(e.target.value, 10) || 2048,
                  }))
                }
                className="w-full p-2 rounded-lg border border-line bg-base text-ink text-xs outline-none focus:border-accent selectable"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSkillEditor;
