import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import QualityStars from '../shared/QualityStars';
import {
  FileCodeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
  RefreshIcon,
  XIcon,
} from '../shared/Icons';
import type { SkillFile, FileTreeNode } from '../../types/delulu';

function getFileIcon(fileName: string, isSkillDoc?: boolean) {
  if (isSkillDoc) return <span className="text-[#3b82f6] font-bold text-xs">✦</span>;
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py':
      return <span className="text-amber-400 font-mono text-[10.5px]">py</span>;
    case 'ts':
    case 'tsx':
      return <span className="text-blue-400 font-mono text-[10.5px]">ts</span>;
    case 'js':
    case 'jsx':
      return <span className="text-yellow-400 font-mono text-[10.5px]">js</span>;
    case 'json':
      return <span className="text-emerald-400 font-mono text-[10.5px]">{'{}'}</span>;
    case 'sh':
    case 'bash':
      return <span className="text-pink-400 font-mono text-[10.5px]">$_</span>;
    default:
      return <FileCodeIcon size={13} className="text-[#858591]" />;
  }
}

interface FileTreeItemProps {
  node: FileTreeNode;
  depth?: number;
  activePath: string | null;
  onOpenFile: (path: string, name: string) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  depth = 0,
  activePath,
  onOpenFile,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (node.type === 'directory') {
    return (
      <div className="flex flex-col">
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-[#24242c] cursor-pointer select-none text-[#cccccc] text-xs transition-colors"
          style={{ paddingLeft: `${Math.max(10, depth * 14 + 10)}px` }}
        >
          <span className="text-[#858591]">
            {expanded ? <ChevronDownIcon size={10} /> : <ChevronRightIcon size={10} />}
          </span>
          <FolderIcon size={13} className="text-[#3b82f6] shrink-0" />
          <span className="truncate text-xs">{node.name}</span>
        </div>

        {expanded && node.children && (
          <div className="flex flex-col">
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activePath={activePath}
                onOpenFile={onOpenFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = node.path === activePath;

  return (
    <div
      onClick={() => onOpenFile(node.path, node.name)}
      className={`
        flex items-center gap-2 py-1 px-2 cursor-pointer select-none text-xs transition-colors group
        ${isActive
          ? 'bg-[#04395e] text-white font-medium'
          : 'text-[#cccccc] hover:bg-[#24242c] hover:text-white'}
      `}
      style={{ paddingLeft: `${Math.max(10, depth * 14 + 18)}px` }}
      title={node.path}
    >
      <span className="w-3.5 flex items-center justify-center shrink-0">
        {getFileIcon(node.name, node.isSkillDoc)}
      </span>
      <span className="truncate flex-1 text-xs">{node.name}</span>
    </div>
  );
};

interface SkillItemProps {
  skill: SkillFile;
  activeSkillPath: string | null;
  onOpenSkill: (skill: SkillFile) => void;
  onOpenFile: (path: string, name: string) => void;
  onDeleteSkill: (path: string) => void;
}

const SkillItem: React.FC<SkillItemProps> = ({
  skill,
  activeSkillPath,
  onOpenSkill,
  onOpenFile,
  onDeleteSkill,
}) => {
  const [folderExpanded, setFolderExpanded] = useState(true);
  const isFolderSkill = !!skill.tree || !!skill.folderPath || skill.isFolder;
  const isSkillActive = skill.path === activeSkillPath;

  if (isFolderSkill && skill.tree) {
    return (
      <div className="flex flex-col">
        {/* Folder Item Header */}
        <div
          onClick={() => setFolderExpanded(!folderExpanded)}
          className={`
            flex items-center gap-1.5 px-3 py-1 cursor-pointer select-none text-xs transition-colors group
            ${isSkillActive ? 'bg-[#04395e] text-white font-medium' : 'text-[#cccccc] hover:bg-[#24242c] hover:text-white'}
          `}
        >
          <span className="text-[#858591]">
            {folderExpanded ? <ChevronDownIcon size={10} /> : <ChevronRightIcon size={10} />}
          </span>
          <FolderIcon size={13} className="text-[#3b82f6] shrink-0" />
          <span className="truncate flex-1 font-medium text-xs">{skill.name}</span>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <QualityStars quality={skill.quality} size="sm" />
            <button
              onClick={() => {
                if (confirm(`Delete skill package "${skill.name}"?`)) {
                  onDeleteSkill(skill.folderPath || skill.path);
                }
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-err text-[#858591] p-0.5"
              title="Delete skill package"
            >
              <XIcon size={11} />
            </button>
          </div>
        </div>

        {/* Directory children */}
        {folderExpanded && (
          <div className="flex flex-col">
            {skill.tree.children && skill.tree.children.length > 0 ? (
              skill.tree.children.map((child) => (
                <FileTreeItem
                  key={child.path}
                  node={child}
                  depth={0}
                  activePath={activeSkillPath}
                  onOpenFile={onOpenFile}
                />
              ))
            ) : (
              <FileTreeItem
                node={{
                  name: 'SKILL.md',
                  path: skill.path,
                  type: 'file',
                  isSkillDoc: true,
                }}
                depth={0}
                activePath={activeSkillPath}
                onOpenFile={onOpenFile}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // Single file skill
  return (
    <div
      onClick={() => onOpenSkill(skill)}
      className={`
        flex items-center gap-2 px-3 py-1 cursor-pointer select-none text-xs transition-colors group
        ${isSkillActive
          ? 'bg-[#04395e] text-white font-medium'
          : 'text-[#cccccc] hover:bg-[#24242c] hover:text-white'}
      `}
    >
      <FileCodeIcon
        size={13}
        className={isSkillActive ? 'text-[#3b82f6]' : 'text-[#858591]'}
      />
      <span className="truncate flex-1 text-xs">{skill.name}</span>

      <div className="flex items-center gap-1.5">
        <QualityStars quality={skill.quality} size="sm" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete skill "${skill.name}"?`)) {
              onDeleteSkill(skill.path);
            }
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-err text-[#858591] p-0.5"
          title="Delete skill"
        >
          <XIcon size={11} />
        </button>
      </div>
    </div>
  );
};

export default function SkillsExplorer() {
  const {
    skills,
    activeTab,
    openSkill,
    openFile,
    deleteSkill,
    setView,
    refreshSkills,
    workspaceFolder,
    setWorkspaceFolder,
  } = useStore();

  const [folderExpanded, setFolderExpanded] = useState(true);
  const folderName = workspaceFolder ? (workspaceFolder.split('/').pop() || 'workspace') : null;

  // Filter skills to only show skills inside the opened workspace folder
  const currentFolderSkills = useMemo(() => {
    if (!workspaceFolder) return [];
    return skills.filter(
      (s) => s.source === 'workspace' || s.path.startsWith(workspaceFolder)
    );
  }, [skills, workspaceFolder]);

  const handleOpenFolder = async () => {
    const folder = await window.deluluAPI.openFolder();
    if (folder) setWorkspaceFolder(folder);
  };

  return (
    <div className="flex flex-col h-full bg-[#18181c] select-none text-[#cccccc] font-sans border-r border-[#26262e]">
      {/* ── Explorer Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b border-[#26262e]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">
          Explorer
        </span>

        {workspaceFolder && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('builder')}
              className="text-[#858591] hover:text-white p-1 rounded hover:bg-[#24242d] transition-colors"
              title="New Skill File (⌘N)"
            >
              <PlusIcon size={13} />
            </button>
            <button
              onClick={() => refreshSkills()}
              className="text-[#858591] hover:text-white p-1 rounded hover:bg-[#24242d] transition-colors"
              title="Refresh Explorer"
            >
              <RefreshIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ── Explorer Body ── */}
      <div className="flex-1 overflow-y-auto">
        {!workspaceFolder ? (
          /* ── Case 1: No Folder Opened (Matches User Screenshot 2) ── */
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] hover:text-white transition-colors text-left"
            >
              <ChevronDownIcon size={11} className="text-[#858591]" />
              <span>No Folder Opened</span>
            </button>

            <p className="text-xs text-[#858591] leading-relaxed mt-1">
              You have not yet opened a folder.
            </p>

            <button
              onClick={handleOpenFolder}
              className="w-full py-2 px-4 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-medium text-xs transition-colors cursor-pointer text-center shadow-sm"
            >
              Open Folder
            </button>

            <p className="text-[11.5px] text-[#858591] leading-relaxed mt-2">
              Opening a folder will load all skill packages in that directory.
            </p>

            <button
              onClick={() => setView('builder')}
              className="w-full py-2 px-4 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-medium text-xs transition-colors cursor-pointer text-center shadow-sm mt-1"
            >
              Create Skill
            </button>
          </div>
        ) : (
          /* ── Case 2: Folder Opened (Shows ONLY Current Folder Tree) ── */
          <div className="flex flex-col py-1">
            {/* Current Opened Folder Section Header */}
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] hover:text-white transition-colors cursor-pointer group">
              <button
                onClick={() => setFolderExpanded(!folderExpanded)}
                className="flex items-center gap-1.5 flex-1 text-left truncate"
              >
                <span className="text-[#858591]">
                  {folderExpanded ? <ChevronDownIcon size={10} /> : <ChevronRightIcon size={10} />}
                </span>
                <span className="truncate">{folderName}</span>
              </button>

              <span className="text-[10px] text-[#858591] font-mono">
                {currentFolderSkills.length} {currentFolderSkills.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>

            {/* Folder Contents Tree */}
            {folderExpanded && (
              <div className="flex flex-col py-0.5">
                {currentFolderSkills.length > 0 ? (
                  currentFolderSkills.map((skill) => (
                    <SkillItem
                      key={skill.path}
                      skill={skill}
                      activeSkillPath={activeTab}
                      onOpenSkill={openSkill}
                      onOpenFile={openFile}
                      onDeleteSkill={deleteSkill}
                    />
                  ))
                ) : (
                  /* If folder has no detected skills */
                  <div className="px-5 py-4 flex flex-col gap-2">
                    <p className="text-xs text-[#858591]">
                      No skills detected in this folder.
                    </p>
                    <button
                      onClick={() => setView('builder')}
                      className="py-1.5 px-3 rounded bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-medium text-center transition-colors cursor-pointer"
                    >
                      + Create Skill in this Folder
                    </button>
                    <button
                      onClick={handleOpenFolder}
                      className="text-xs text-[#3794ff] hover:underline text-left mt-1 cursor-pointer"
                    >
                      Open different folder…
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
