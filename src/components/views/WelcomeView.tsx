import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import SkillImportModal from '../shared/SkillImportModal';
import {
  FileCodeIcon,
  FolderIcon,
  PlusIcon,
  LibraryIcon,
  FlaskConicalIcon,
  BotIcon,
  SparklesIcon,
  StarIcon,
  XIcon,
} from '../shared/Icons';
import DeluluLogo from '../shared/DeluluLogo';

export default function WelcomeView() {
  const {
    skills,
    openSkill,
    setView,
    setWorkspaceFolder,
    workspaceFolder,
  } = useStore();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<{ name: string; content: string } | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOnStartup, setShowOnStartup] = useState(true);

  const folderPath = workspaceFolder || '~/adobe/skills';

  const handleOpenFolder = async () => {
    const folder = await window.deluluAPI.openFolder();
    if (folder) setWorkspaceFolder(folder);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setDroppedFile({ name: file.name, content: content || '' });
        setImportModalOpen(true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col h-full bg-[#18181c] text-[#cccccc] overflow-y-auto select-none font-sans relative ${
        isDragOver ? 'bg-accent/5 ring-2 ring-inset ring-accent' : ''
      }`}
    >
      {/* VS Code Welcome Tab Header */}
      <div className="flex items-center bg-[#18181c] border-b border-[#26262e] px-2 h-9 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e24] text-white text-xs font-medium border-t-2 border-t-[#007acc] rounded-t">
          <DeluluLogo size={14} showText={false} />
          <span>Welcome</span>
          <span className="text-[#858591] hover:text-white cursor-pointer ml-1">✕</span>
        </div>
      </div>

      {/* Main Centered Body */}
      <div className="flex-1 flex flex-col items-center justify-between p-8 md:p-12 max-w-5xl mx-auto w-full">
        <div className="w-full flex flex-col gap-10">
          {/* Hero Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Delulu
              </h1>
              <span className="text-xs font-mono text-[#858591] px-2 py-0.5 rounded bg-[#24242d] border border-[#2e2e38] truncate max-w-md">
                {folderPath}
              </span>
            </div>
            <p className="text-base text-[#858591]">
              AI Skill Studio · Author, benchmark, and deploy skills across AI agents.
            </p>
          </div>

          {/* 2-Column VS Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start w-full">
            {/* ── LEFT COLUMN: Start & Recent ── */}
            <div className="flex flex-col gap-8">
              {/* Start */}
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-white">Start</h2>

                <div className="flex flex-col gap-2.5 text-xs">
                  <button
                    onClick={() => setView('builder')}
                    className="flex items-center gap-2.5 text-[#3794ff] hover:underline text-left cursor-pointer font-medium"
                  >
                    <PlusIcon size={16} />
                    <span>New Skill…</span>
                  </button>

                  <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-2.5 text-[#3794ff] hover:underline text-left cursor-pointer font-medium"
                  >
                    <FolderIcon size={16} />
                    <span>Open Workspace Folder…</span>
                  </button>

                  <button
                    onClick={() => {
                      setDroppedFile(undefined);
                      setImportModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 text-[#3794ff] hover:underline text-left cursor-pointer font-medium"
                  >
                    <BotIcon size={16} />
                    <span>Import / Symlink Skill…</span>
                  </button>

                  <button
                    onClick={() => setView('gallery')}
                    className="flex items-center gap-2.5 text-[#3794ff] hover:underline text-left cursor-pointer font-medium"
                  >
                    <LibraryIcon size={16} />
                    <span>Browse Skills Gallery…</span>
                  </button>
                </div>
              </div>

              {/* Recent */}
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-white">Recent</h2>

                {skills.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {skills.slice(0, 5).map((skill) => (
                      <div
                        key={skill.path}
                        onClick={() => openSkill(skill)}
                        className="flex items-baseline justify-between text-xs group cursor-pointer"
                      >
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className="text-[#3794ff] hover:underline font-medium truncate">
                            {skill.name}
                          </span>
                          <span className="text-[#777785] text-[11px] font-mono truncate max-w-xs">
                            {skill.folderPath || skill.path}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#858591] hover:text-white ml-2 text-xs"
                          title="Remove from recents"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => useStore.getState().setPanel('explorer')}
                      className="text-xs text-[#3794ff] hover:underline text-left mt-1 cursor-pointer"
                    >
                      More…
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#858591]">No recent skills opened</p>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Walkthroughs ── */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white">Walkthroughs</h2>

              <div className="flex flex-col gap-2.5">
                {/* Walkthrough 1 */}
                <div
                  onClick={() => setView('builder')}
                  className="p-3.5 rounded-lg bg-[#24242d] hover:bg-[#2c2c36] border border-[#2e2e38] transition-all cursor-pointer group flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded bg-[#007acc] text-white shrink-0 mt-0.5">
                      <StarIcon filled size={13} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs font-semibold text-white group-hover:text-[#3794ff] transition-colors">
                        Get started with Delulu
                      </h3>
                      <p className="text-[11.5px] text-[#858591] mt-0.5 leading-relaxed">
                        Customize your editor, learn the basics, and start authoring skills.
                      </p>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#007acc] w-3/4 rounded-full" />
                  </div>
                </div>

                {/* Walkthrough 2 */}
                <div
                  onClick={() => {
                    setDroppedFile(undefined);
                    setImportModalOpen(true);
                  }}
                  className="p-3.5 rounded-lg bg-[#24242d] hover:bg-[#2c2c36] border border-[#2e2e38] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded bg-purple-600 text-white shrink-0 mt-0.5">
                      <BotIcon size={13} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                          Get started with Multi-Agent Symlinks
                        </h3>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-[#007acc] text-white uppercase">
                          New
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#858591] mt-0.5">
                        Store once in vault and auto-symlink across Cursor, Claude, and Gemini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Walkthrough 3 */}
                <div
                  onClick={() => setView('evals')}
                  className="p-3.5 rounded-lg bg-[#24242d] hover:bg-[#2c2c36] border border-[#2e2e38] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded bg-emerald-600 text-white shrink-0 mt-0.5">
                      <FlaskConicalIcon size={13} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          AI Playground & Evals Studio
                        </h3>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-[#007acc] text-white uppercase">
                          Updated
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#858591] mt-0.5">
                        Test and benchmark skills against local Ollama, Claude, or Gemini sessions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Walkthrough 4 */}
                <div
                  onClick={() => setView('gallery')}
                  className="p-3.5 rounded-lg bg-[#24242d] hover:bg-[#2c2c36] border border-[#2e2e38] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded bg-amber-600 text-white shrink-0 mt-0.5">
                      <SparklesIcon size={13} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        Explore Templates & Community Skills
                      </h3>
                      <p className="text-[11.5px] text-[#858591] mt-0.5">
                        Browse pre-configured templates for code review, data analysis, and APIs.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setView('gallery')}
                  className="text-xs text-[#3794ff] hover:underline text-left mt-1 cursor-pointer"
                >
                  More…
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action Button + Startup Checkbox */}
        <div className="flex flex-col items-center gap-3 pt-6 w-full">
          <button
            onClick={() => setView('evals')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#24242d] hover:bg-[#2c2c36] border border-[#2e2e38] text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <BotIcon size={14} className="text-[#3794ff]" />
            <span>Try out the new Local AI Playground</span>
          </button>

          <label className="flex items-center gap-2 text-xs text-[#858591] cursor-pointer">
            <input
              type="checkbox"
              checked={showOnStartup}
              onChange={(e) => setShowOnStartup(e.target.checked)}
              className="rounded accent-[#007acc]"
            />
            <span>Show welcome page on startup</span>
          </label>
        </div>
      </div>

      {/* Skill Import Modal */}
      <SkillImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialFile={droppedFile}
      />
    </div>
  );
}
