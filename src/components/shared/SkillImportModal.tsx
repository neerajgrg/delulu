import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  SparklesIcon,
  CheckIcon,
  XIcon,
  FolderIcon,
  FileCodeIcon,
  BotIcon,
} from './Icons';

interface SkillImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile?: { name: string; content: string };
}

export default function SkillImportModal({
  isOpen,
  onClose,
  initialFile,
}: SkillImportModalProps) {
  const { refreshSkills, openSkill, workspaceFolder } = useStore();

  const [fileName, setFileName] = useState(initialFile?.name || 'my-skill.skill.md');
  const [content, setContent] = useState(initialFile?.content || '');
  const [isImporting, setIsImporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Symlink distribution targets
  const [targets, setTargets] = useState<{ id: string; name: string; path: string; selected: boolean }[]>([
    { id: 'cursor', name: 'Cursor AI', path: '~/.cursor/skills/', selected: true },
    { id: 'agents', name: 'Local Agents', path: '~/.agents/skills/', selected: true },
    { id: 'claude', name: 'Claude Code CLI', path: '~/.claude/skills/', selected: true },
    { id: 'gemini', name: 'Gemini / Antigravity', path: '~/.gemini/skills/', selected: true },
    { id: 'workspace', name: 'Project Workspace', path: 'workspace/skills/', selected: !!workspaceFolder },
  ]);

  if (!isOpen) return null;

  const toggleTarget = (id: string) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name.endsWith('.md') ? file.name : `${file.name}.skill.md`);
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(String(event.target?.result || ''));
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.endsWith('.md') ? file.name : `${file.name}.skill.md`);
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(String(event.target?.result || ''));
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!fileName.trim() || !content.trim() || isImporting) return;
    setIsImporting(true);

    try {
      const selectedTargetIds = targets.filter((t) => t.selected).map((t) => t.id);
      const res = await window.deluluAPI.importSkillToVault(
        fileName,
        content,
        selectedTargetIds,
        workspaceFolder || undefined
      );

      setSuccess(`Skill copied to central Delulu memory and symlinked to ${res.linkedTo.length} agents.`);
      await refreshSkills();

      setTimeout(() => {
        onClose();
        openSkill({
          path: res.vaultPath,
          name: fileName.replace(/\.(skill\.)?md$/i, ''),
          source: 'custom',
          quality: 4,
          mtime: Date.now(),
        });
      }, 1000);
    } catch {
      // ignore
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-2 border border-line rounded-xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-surface">
          <div className="flex items-center gap-2">
            <SparklesIcon size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-ink font-sans tracking-tight">
              Import Skill to Delulu Memory
            </h2>
          </div>
          <button onClick={onClose} className="text-ink-dim hover:text-ink">
            <XIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-line hover:border-accent/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-base/40 text-center cursor-pointer transition-colors"
            onClick={() => document.getElementById('skill-file-input')?.click()}
          >
            <input
              id="skill-file-input"
              type="file"
              accept=".md,.skill.md,.markdown"
              className="hidden"
              onChange={handleFileSelect}
            />
            <FileCodeIcon size={28} className="text-accent-bright opacity-80 mb-1" />
            <span className="text-xs font-semibold text-ink font-sans">
              Drag & Drop skill file here, or browse
            </span>
            <span className="text-3xs font-mono text-ink-dim">
              Supports .skill.md, .md, and Cursor rules
            </span>
          </div>

          {/* Skill Name */}
          <div className="flex flex-col gap-1">
            <label className="text-3xs font-mono uppercase tracking-wider text-ink-dim">
              Skill File Name (in ~/.delulu/skills/)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="my-skill.skill.md"
              className="input font-mono text-xs py-1"
            />
          </div>

          {/* Symlink Distribution Selector */}
          <div className="flex flex-col gap-2 bg-surface p-3.5 rounded-xl border border-line">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-dim font-semibold flex items-center gap-1.5">
                <BotIcon size={12} className="text-accent" />
                <span>Auto-Create Symlinks in Agent Directories</span>
              </span>
              <span className="text-3xs font-mono text-ok">Single Source of Truth</span>
            </div>
            <p className="text-3xs text-ink-dim leading-relaxed">
              Delulu keeps the master skill in memory and creates symlinks so all your tools stay automatically synced.
            </p>

            <div className="flex flex-col gap-1.5 mt-1">
              {targets.map((target) => (
                <label
                  key={target.id}
                  onClick={() => toggleTarget(target.id)}
                  className={`
                    flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all
                    ${target.selected
                      ? 'bg-accent/10 border-accent/40 text-ink'
                      : 'bg-base/40 border-line text-ink-muted hover:border-line-bright'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-3xs ${
                        target.selected ? 'bg-accent text-white' : 'border border-line bg-surface-3'
                      }`}
                    >
                      {target.selected && <CheckIcon size={9} />}
                    </span>
                    <span className="text-xs font-medium font-sans">{target.name}</span>
                  </div>
                  <span className="text-3xs font-mono text-ink-dim">{target.path}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-ok/10 border border-ok/30 rounded-lg text-ok text-xs flex items-center gap-2">
              <CheckIcon size={14} />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-surface">
          <button onClick={onClose} className="btn-outline text-xs">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !content.trim()}
            className="btn-primary text-xs py-1.5 px-4"
          >
            <SparklesIcon size={12} />
            <span>{isImporting ? 'Importing…' : 'Import to Vault & Symlink'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
