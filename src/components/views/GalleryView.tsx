import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import SkillCard from '../shared/SkillCard';
import { SearchIcon, PlusIcon, LibraryIcon } from '../shared/Icons';

type Source = 'all' | 'custom' | 'plugin' | 'cursor' | 'agents' | 'workspace';

export default function GalleryView() {
  const { skills, search, setSearch, openSkill, setView } = useStore();
  const [source, setSource] = useState<Source>('all');
  const [sort, setSort]     = useState<'quality' | 'name' | 'recent'>('quality');

  const filtered = useMemo(() => {
    let list = source === 'all' ? skills : skills.filter((s) => s.source === source);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.pluginName && s.pluginName.toLowerCase().includes(q)) ||
          s.description?.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'quality') return b.quality - a.quality;
      if (sort === 'recent')  return b.mtime - a.mtime;
      return a.name.localeCompare(b.name);
    });
  }, [skills, source, search, sort]);

  const counts = {
    all: skills.length,
    custom: skills.filter((s) => s.source === 'custom').length,
    plugin: skills.filter((s) => s.source === 'plugin').length,
    cursor: skills.filter((s) => s.source === 'cursor').length,
    agents: skills.filter((s) => s.source === 'agents').length,
    workspace: skills.filter((s) => s.source === 'workspace').length,
  };

  const tabs: { id: Source; label: string }[] = [
    { id: 'all', label: 'All Skills' },
    { id: 'custom', label: '✦ Delulu Vault' },
    { id: 'plugin', label: '🧩 Plugins' },
    { id: 'cursor', label: '.cursor' },
    { id: 'agents', label: '.agents' },
    { id: 'workspace', label: 'Workspace' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base animate-fade-in select-none">
      {/* Header Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-line bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <LibraryIcon size={16} className="text-accent" />
          <h1 className="text-sm font-semibold text-ink tracking-tight font-sans">
            Skills Gallery
          </h1>
          <span className="text-3xs font-mono bg-surface-3 text-ink-dim border border-line px-1.5 py-0.5 rounded">
            {filtered.length} / {skills.length}
          </span>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-56">
          <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, plugin, tag…"
            className="input pl-8 py-1 text-xs"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="input w-36 py-1 text-xs font-sans"
        >
          <option value="quality">Sort by Quality</option>
          <option value="recent">Recently Modified</option>
          <option value="name">Alphabetical</option>
        </select>

        <button onClick={() => setView('builder')} className="btn-primary py-1 px-3 text-xs">
          <PlusIcon size={13} />
          <span>New Skill</span>
        </button>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex gap-1.5 px-6 py-2 border-b border-line bg-surface/60 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSource(tab.id)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150
              ${source === tab.id
                ? 'bg-surface-3 text-ink border border-line-bright shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent'}
            `}
          >
            <span>{tab.label}</span>
            <span className="text-3xs font-mono opacity-60">({counts[tab.id]})</span>
          </button>
        ))}
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-dim gap-3 text-center">
            <SearchIcon size={28} className="opacity-30" />
            <div>
              <p className="text-xs font-medium text-ink-muted">No matching skills found</p>
              <p className="text-3xs text-ink-dim mt-0.5">Try searching with a different keyword</p>
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="btn-ghost text-xs mt-1">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {filtered.map((skill) => (
              <SkillCard key={skill.path} skill={skill} onOpen={() => openSkill(skill)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
