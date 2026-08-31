import React from 'react';
import type { SkillFile } from '../../types/delulu';
import QualityStars from './QualityStars';
import { FileCodeIcon, ChevronRightIcon } from './Icons';

interface SkillCardProps {
  skill: SkillFile;
  onOpen: () => void;
}

const SOURCE_BADGES: Record<string, string> = {
  custom: 'badge-workspace text-accent-bright border-accent/40',
  plugin: 'badge-agents text-purple-400 border-purple-500/40 bg-purple-500/10',
  cursor: 'badge-cursor',
  agents: 'badge-agents',
  workspace: 'badge-workspace',
};

const SOURCE_LABELS: Record<string, string> = {
  custom: 'Delulu Vault',
  plugin: 'Plugin',
  cursor: '.cursor',
  agents: '.agents',
  workspace: 'workspace',
};

const MAX_VISIBLE_TAGS = 3;

const SkillCard: React.FC<SkillCardProps> = ({ skill, onOpen }) => {
  const tags = skill.tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = tags.length - MAX_VISIBLE_TAGS;
  const badgeCls = SOURCE_BADGES[skill.source] ?? 'badge-workspace';
  const sourceLabel = skill.pluginName ? `🧩 ${skill.pluginName}` : (SOURCE_LABELS[skill.source] ?? skill.source);

  return (
    <div
      onClick={onOpen}
      className="card-linear p-4 flex flex-col gap-2.5 cursor-pointer group select-none relative"
    >
      {/* Header Row: Title & Source Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <FileCodeIcon size={14} className="text-ink-dim group-hover:text-accent-bright shrink-0 transition-colors" />
          <span className="font-mono text-xs font-semibold text-ink truncate group-hover:text-accent-bright transition-colors" title={skill.name}>
            {skill.name}
          </span>
        </div>
        <span className={`shrink-0 text-3xs font-mono px-1.5 py-0.2 rounded border ${badgeCls}`}>
          {sourceLabel}
        </span>
      </div>

      {/* Trigger Keyword Pill */}
      {skill.trigger && (
        <div className="flex items-center gap-1">
          <span className="text-3xs font-mono bg-surface-3 border border-line text-amber-400/90 px-1.5 py-0.5 rounded">
            /{skill.trigger}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed h-8">
        {skill.description || 'No description specified.'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 min-h-5 mt-auto pt-1">
        {visibleTags.map((tag) => (
          <span key={tag} className="tag text-3xs py-0.2">
            #{tag}
          </span>
        ))}
        {extraTagCount > 0 && (
          <span className="tag text-3xs text-ink-dim py-0.2">+{extraTagCount}</span>
        )}
      </div>

      {/* Footer: Quality Stars & Open CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-line mt-1">
        <QualityStars quality={skill.quality} size="sm" />
        <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-ink-muted group-hover:text-accent-bright transition-colors">
          <span>Open</span>
          <ChevronRightIcon size={12} />
        </span>
      </div>
    </div>
  );
};

export default SkillCard;
