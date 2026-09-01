import React from 'react';
import { XIcon, SparklesIcon } from '../shared/Icons';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
  category: 'Navigation' | 'Editor' | 'Tools';
}

const SHORTCUTS: ShortcutItem[] = [
  { key: '⌘ K / ⌘ P', description: 'Open Global Command Palette', category: 'Navigation' },
  { key: '⌘ B', description: 'Toggle Primary Sidebar', category: 'Navigation' },
  { key: '⌘ J', description: 'Toggle Bottom Console & Skill REPL', category: 'Navigation' },
  { key: '⌘ ,', description: 'Open Settings & Local Agents', category: 'Navigation' },
  { key: '⌘ 1', description: 'Switch to Welcome / Dashboard', category: 'Navigation' },
  { key: '⌘ 2', description: 'Switch to Skill Editor', category: 'Navigation' },
  { key: '⌘ 3', description: 'Switch to AI Evals & Playground', category: 'Navigation' },
  { key: '⌘ 4', description: 'Switch to Templates & Plugins Gallery', category: 'Navigation' },
  { key: '⌘ D', description: 'Open Developer Documentation', category: 'Navigation' },

  { key: '⌘ S', description: 'Save Active Skill File', category: 'Editor' },
  { key: '⌘ N', description: 'Author New Skill (Wizard)', category: 'Editor' },
  { key: '⌘ W', description: 'Close Active Tab', category: 'Editor' },
  { key: '⌘ Z / ⌘ ⇧ Z', description: 'Undo / Redo changes', category: 'Editor' },
  { key: '⌘ F', description: 'Find / Search Skills', category: 'Editor' },

  { key: '⌘ ⏎', description: 'Execute Skill in Playground / REPL', category: 'Tools' },
  { key: 'F11', description: 'Toggle Fullscreen Mode', category: 'Tools' },
  { key: 'Esc', description: 'Close Modals and Menus', category: 'Tools' },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col font-sans max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-2">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-accent-bright" />
            <h2 className="text-sm font-bold text-ink">Keyboard Shortcuts Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-3 text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {(['Navigation', 'Editor', 'Tools'] as const).map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="text-2xs uppercase tracking-wider font-bold text-ink-dim px-1">
                {category}
              </h3>
              <div className="rounded-xl border border-line bg-base divide-y divide-line overflow-hidden">
                {SHORTCUTS.filter((s) => s.category === category).map((s) => (
                  <div key={s.key} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <span className="text-ink-muted font-medium">{s.description}</span>
                    <kbd className="px-2 py-1 rounded bg-surface-3 border border-line-bright font-mono text-2xs text-accent-bright font-semibold shadow-xs">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-line bg-surface-2">
          <span className="text-3xs text-ink-dim">Press Esc to dismiss</span>
          <button onClick={onClose} className="btn-primary text-xs py-1.5 px-4">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
