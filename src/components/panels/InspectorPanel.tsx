import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import QualityStars from '../shared/QualityStars';
import {
  SparklesIcon,
  CheckIcon,
  XIcon,
  FileCodeIcon,
  FolderIcon,
  BotIcon,
} from '../shared/Icons';
import type { SymlinkTarget } from '../../types/delulu';

const qualityAdvice: Record<number, string> = {
  0: 'Start by adding a name and description.',
  1: 'Add a description longer than 20 characters.',
  2: 'Add a trigger keyword so agents can invoke this skill.',
  3: 'Add at least one tag to help with discovery.',
  4: 'Add examples and constraints to reach full quality.',
  5: 'This skill is fully defined and production-ready. 🎉',
};

const sourceBadgeClass: Record<string, string> = {
  custom: 'badge-workspace',
  cursor: 'badge-cursor',
  agents: 'badge-agents',
  workspace: 'badge-workspace',
};

const InspectorPanel: React.FC = () => {
  const { tabs, activeTab, skills, workspaceFolder } = useStore();

  const currentTab = tabs.find((t) => t.path === activeTab) ?? null;
  const skill = skills.find((s) => s.path === activeTab) ?? (currentTab ? {
    path: currentTab.path,
    name: currentTab.name,
    source: 'custom' as const,
    quality: 0,
    mtime: Date.now(),
  } : null);

  const [targets, setTargets] = useState<SymlinkTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  useEffect(() => {
    if (!skill) return;
    const fileName = skill.path.split('/').pop() || `${skill.name}.skill.md`;
    setLoadingTargets(true);
    window.deluluAPI
      .getSymlinkTargets(fileName, workspaceFolder || undefined)
      .then((res) => {
        setTargets(res);
      })
      .catch(() => {})
      .finally(() => setLoadingTargets(false));
  }, [skill, workspaceFolder]);

  const handleToggleSymlink = async (targetId: string, currentStatus: boolean) => {
    if (!skill) return;
    const fileName = skill.path.split('/').pop() || `${skill.name}.skill.md`;
    const nextStatus = !currentStatus;

    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, isLinked: nextStatus } : t))
    );

    await window.deluluAPI.toggleSymlink(
      fileName,
      targetId,
      nextStatus,
      workspaceFolder || undefined
    );
  };

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-ink-dim px-6 text-center select-none">
        <FileCodeIcon size={32} className="opacity-20 mb-1" />
        <p className="text-xs font-medium text-ink-muted">No skill open</p>
        <p className="text-3xs text-ink-dim leading-relaxed">
          Open a skill file from the Explorer to inspect metadata and manage agent symlinks.
        </p>
      </div>
    );
  }

  const q = skill.quality ?? 0;
  const advice = qualityAdvice[q] ?? qualityAdvice[5];
  const badgeCls = sourceBadgeClass[skill.source] ?? 'badge-workspace';

  const checks = [
    { label: 'Skill Name Defined', passed: !!skill.name },
    { label: 'Detailed Description (>20 chars)', passed: (skill.description?.length ?? 0) >= 20 },
    { label: 'Trigger Slash-Command', passed: !!skill.trigger },
    { label: 'Tags for Discovery', passed: (skill.tags?.length ?? 0) > 0 },
    { label: 'Guardrails & Examples', passed: q >= 4 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full text-ink select-none font-sans">
      {/* Quality Score Hero */}
      <section className="flex flex-col items-center gap-2 bg-surface border border-line rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-1 text-accent">
          <SparklesIcon size={14} />
          <span className="text-3xs font-mono uppercase tracking-wider font-semibold">
            Quality Score
          </span>
        </div>
        <span className="text-3xl font-bold text-ink font-mono">{q} / 5</span>
        <QualityStars quality={q} size="md" />
        <p className="text-3xs text-ink-dim text-center leading-relaxed mt-1">{advice}</p>
      </section>

      {/* Agent Symlink Distribution Hub */}
      <section className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-3xs font-mono uppercase tracking-wider text-ink-dim font-semibold flex items-center gap-1">
            <BotIcon size={12} className="text-accent" />
            <span>Agent Symlinks & Sync</span>
          </span>
          <span className="text-3xs font-mono text-ink-dim">Single Source</span>
        </div>
        <p className="text-3xs text-ink-dim leading-relaxed">
          Symlinks keep this skill in sync across external agent folders without duplicating files.
        </p>

        <div className="flex flex-col gap-1.5 mt-1">
          {targets.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggleSymlink(t.id, t.isLinked)}
              className={`
                flex items-center justify-between p-2 rounded border cursor-pointer transition-colors
                ${t.isLinked ? 'bg-surface-2 border-accent/40 text-ink' : 'bg-base/40 border-line text-ink-dim hover:border-line-bright'}
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center text-3xs shrink-0 ${
                    t.isLinked ? 'bg-ok text-white' : 'border border-line bg-surface-3'
                  }`}
                >
                  {t.isLinked && <CheckIcon size={9} />}
                </span>
                <span className="text-xs font-medium truncate font-sans">{t.name}</span>
              </div>

              <span
                className={`text-3xs font-mono px-1.5 py-0.2 rounded shrink-0 ${
                  t.isLinked ? 'bg-ok/10 text-ok border border-ok/30' : 'bg-surface-3 text-ink-dim'
                }`}
              >
                {t.isLinked ? 'Symlinked' : 'Unlinked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Checklist */}
      <section className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-2">
        <span className="text-3xs font-mono uppercase tracking-wider text-ink-dim font-semibold">
          Quality Checklist
        </span>
        <div className="flex flex-col gap-1.5">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className={`w-4 h-4 rounded flex items-center justify-center text-3xs shrink-0 ${
                  c.passed
                    ? 'bg-ok/15 text-ok border border-ok/30'
                    : 'bg-surface-3 text-ink-dim border border-line'
                }`}
              >
                {c.passed ? <CheckIcon size={10} /> : <XIcon size={10} />}
              </span>
              <span className={c.passed ? 'text-ink font-medium' : 'text-ink-dim'}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Name */}
      <section className="bg-surface border border-line rounded-xl p-3">
        <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-1 font-semibold">
          Name
        </h3>
        <p className="text-xs font-semibold text-ink font-mono break-all">{skill.name}</p>
      </section>

      {/* Source Location */}
      <section className="bg-surface border border-line rounded-xl p-3">
        <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
          Master Source
        </h3>
        <span className={badgeCls}>
          {skill.source === 'custom' ? 'Delulu Memory' : skill.source === 'plugin' ? 'Plugin / Extension' : skill.source}
        </span>
        {skill.pluginName && (
          <div className="mt-2 pt-2 border-t border-line text-3xs font-mono flex items-center justify-between text-purple-400">
            <span>Plugin Bundle:</span>
            <span className="font-semibold px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/30 rounded">
              🧩 {skill.pluginName}
            </span>
          </div>
        )}
      </section>

      {/* Description */}
      {skill.description && (
        <section className="bg-surface border border-line rounded-xl p-3">
          <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-1 font-semibold">
            Description
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">{skill.description}</p>
        </section>
      )}

      {/* Trigger */}
      {skill.trigger && (
        <section className="bg-surface border border-line rounded-xl p-3">
          <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-1 font-semibold">
            Trigger Command
          </h3>
          <code className="text-xs text-warn bg-surface-3 px-2 py-0.5 rounded font-mono border border-line">
            /{skill.trigger}
          </code>
        </section>
      )}

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <section className="bg-surface border border-line rounded-xl p-3">
          <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1">
            {skill.tags.map((tag: string) => (
              <span key={tag} className="tag text-3xs font-mono">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Path */}
      <section className="bg-surface border border-line rounded-xl p-3">
        <h3 className="text-3xs font-mono uppercase tracking-wider text-ink-dim mb-1 font-semibold flex items-center gap-1">
          <FolderIcon size={11} />
          <span>File Path</span>
        </h3>
        <p className="text-3xs text-ink-dim font-mono break-all leading-relaxed">{skill.path}</p>
      </section>
    </div>
  );
};

export default InspectorPanel;
