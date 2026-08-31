import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore, type MainView } from '../../store/useStore';
import {
  SearchIcon,
  FileCodeIcon,
  SparklesIcon,
  FlaskConicalIcon,
  LibraryIcon,
  BotIcon,
  SettingsIcon,
  PlusIcon,
  FolderIcon,
  SunIcon,
  MoonIcon,
} from '../shared/Icons';

interface PaletteItem {
  id: string;
  category: 'Skills' | 'Navigation' | 'AI Actions' | 'Commands';
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    skills,
    openSkill,
    setView,
    toggleTheme,
    theme,
    toggleSidebar,
    toggleBottomConsole,
    refreshSkills,
    refreshAgents,
    workspaceFolder,
  } = useStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    // 1. Skill Files
    skills.forEach((s) => {
      list.push({
        id: `skill-${s.path}`,
        category: 'Skills',
        title: s.name,
        subtitle: `${s.source} · ${s.description || s.path}`,
        icon: <FileCodeIcon size={14} className="text-accent-bright" />,
        action: () => {
          openSkill(s);
          setCommandPaletteOpen(false);
        },
      });
    });

    // 2. Navigation
    const navItems: { view: MainView; label: string; icon: React.ReactNode; shortcut?: string }[] = [
      { view: 'welcome', label: 'Go to Home / Dashboard', icon: <SparklesIcon size={14} /> },
      { view: 'editor', label: 'Go to Code Editor', icon: <FileCodeIcon size={14} />, shortcut: '⌘1' },
      { view: 'gallery', label: 'Browse Skills Gallery', icon: <LibraryIcon size={14} />, shortcut: '⌘2' },
      { view: 'evals', label: 'Open Evals Test Runner', icon: <FlaskConicalIcon size={14} />, shortcut: '⌘3' },
      { view: 'builder', label: 'Create New Skill (Wizard)', icon: <PlusIcon size={14} />, shortcut: '⌘N' },
      { view: 'settings', label: 'Preferences & Local Agents', icon: <SettingsIcon size={14} />, shortcut: '⌘,' },
    ];

    navItems.forEach((n) => {
      list.push({
        id: `nav-${n.view}`,
        category: 'Navigation',
        title: n.label,
        shortcut: n.shortcut,
        icon: n.icon,
        action: () => {
          setView(n.view);
          setCommandPaletteOpen(false);
        },
      });
    });

    // 3. AI Actions
    list.push({
      id: 'ai-eval',
      category: 'AI Actions',
      title: 'Run Evaluation on Active Skill',
      subtitle: 'Execute skill prompt with active local agent',
      icon: <FlaskConicalIcon size={14} className="text-ok" />,
      action: () => {
        setView('evals');
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'ai-detect-agents',
      category: 'AI Actions',
      title: 'Rescan Local Agent Sessions',
      subtitle: 'Detect Claude, Gemini, Ollama, Cursor on machine',
      icon: <BotIcon size={14} className="text-accent" />,
      action: () => {
        refreshAgents();
        setView('agents');
        setCommandPaletteOpen(false);
      },
    });

    // 4. IDE Commands
    list.push({
      id: 'cmd-theme',
      category: 'Commands',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
      shortcut: '⌘T',
      icon: theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'cmd-toggle-sidebar',
      category: 'Commands',
      title: 'Toggle Primary Sidebar',
      shortcut: '⌘B',
      icon: <FolderIcon size={14} />,
      action: () => {
        toggleSidebar();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'cmd-toggle-bottom',
      category: 'Commands',
      title: 'Toggle Bottom Console & Problems',
      shortcut: '⌘J',
      icon: <FlaskConicalIcon size={14} />,
      action: () => {
        toggleBottomConsole();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'cmd-refresh-skills',
      category: 'Commands',
      title: 'Reload Workspace Skills',
      subtitle: workspaceFolder || 'All locations',
      icon: <SparklesIcon size={14} />,
      action: () => {
        refreshSkills();
        setCommandPaletteOpen(false);
      },
    });

    return list;
  }, [
    skills,
    theme,
    workspaceFolder,
    openSkill,
    setView,
    setCommandPaletteOpen,
    toggleTheme,
    toggleSidebar,
    toggleBottomConsole,
    refreshSkills,
    refreshAgents,
  ]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[selectedIndex];
      if (item) item.action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface-2 border border-line rounded-xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
        style={{ maxHeight: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface">
          <SearchIcon size={16} className="text-accent" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search skills… (Press Esc to exit)"
            className="bg-transparent text-sm text-ink placeholder-ink-dim outline-none w-full font-sans"
          />
          <span className="text-3xs font-mono text-ink-dim bg-surface-3 px-1.5 py-0.5 rounded border border-line">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 select-none">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-dim font-mono">
              No matching commands or skills found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${isSelected ? 'bg-accent/15 border border-accent/30 text-ink' : 'hover:bg-surface-3 text-ink-muted border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'text-accent-bright bg-accent/20' : 'text-ink-dim bg-surface-3'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium font-sans truncate ${isSelected ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                          {item.title}
                        </span>
                        <span className="text-3xs font-mono text-ink-dim px-1.5 py-0.2 bg-base/50 rounded">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-3xs font-mono text-ink-dim truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <span className="text-3xs font-mono text-ink-dim bg-surface-3 border border-line px-1.5 py-0.5 rounded shrink-0">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-line bg-surface text-3xs font-mono text-ink-dim">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Delulu Command Hub</span>
        </div>
      </div>
    </div>
  );
}
