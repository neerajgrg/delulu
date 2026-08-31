import { useStore } from '../../store/useStore';
import AppMenuBar from './AppMenuBar';
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  FlaskConicalIcon,
  FileCodeIcon,
  BotIcon,
} from '../shared/Icons';
import DeluluLogo from '../shared/DeluluLogo';

export default function TitleBar() {
  const {
    theme,
    toggleTheme,
    setView,
    setCommandPaletteOpen,
    activeTab,
    workspaceFolder,
    detectedAgents,
    settings,
  } = useStore();

  const folderName = workspaceFolder
    ? workspaceFolder.replace(/\/+$/, '').split('/').pop() || 'workspace'
    : 'workspace';

  const activeFileName = activeTab ? activeTab.split('/').pop()?.replace(/\.skill\.md$/, '') : null;

  const activeAgent = detectedAgents.find((a) => a.id === settings.activeProvider) || {
    name: 'Local Ollama',
    detected: true,
  };

  return (
    <header
      className="drag flex items-center justify-between bg-[#18181c] border-b border-[#26262e] px-3 shrink-0 select-none font-sans"
      style={{ height: 38 }}
    >
      {/* Left: Window Controls, Brand & Application Menubar */}
      <div className="no-drag flex items-center gap-3">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-1.5 pr-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block opacity-90" />
        </div>

        {/* Brand Icon */}
        <button
          onClick={() => setView('welcome')}
          className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer group"
          title="Delulu Studio"
        >
          <DeluluLogo size={16} showText={false} />
        </button>

        {/* Top-Level Native IDE Menubar (File, Edit, View, Skill, Window, Help) */}
        <AppMenuBar />
      </div>

      {/* Center: Simplified VS Code Style Global Search / Breadcrumb */}
      <div className="no-drag flex items-center justify-center flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1 rounded-md bg-[#1f1f24] hover:bg-[#25252c] border border-[#2e2e38] hover:border-[#3e3e4a] text-[#858591] hover:text-[#cccccc] text-xs transition-all cursor-pointer shadow-inner group"
          title="Global Search & Command Palette (⌘K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <SearchIcon size={12} className="text-[#858591] group-hover:text-[#cccccc]" />
            <span className="text-[#858591] font-mono text-[11px]">{folderName}</span>
            {activeFileName && (
              <>
                <span className="text-[#555562]">/</span>
                <span className="text-[#3b82f6] font-mono text-[11px] font-medium truncate">
                  {activeFileName}.skill.md
                </span>
              </>
            )}
          </div>
          <kbd className="font-mono text-[10px] bg-[#2a2d3d] text-[#858591] px-1.5 py-0.5 rounded border border-[#3e3e4a]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Engine Indicator & Quick Actions */}
      <div className="no-drag flex items-center gap-2">
        {/* Active Engine Badge */}
        <button
          onClick={() => setView('settings')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-[#858591] hover:text-white hover:bg-[#202026] transition-colors cursor-pointer"
          title="Manage AI Runtimes & Providers"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="truncate max-w-28">{activeAgent.name}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1 text-[#858591] hover:text-white rounded hover:bg-[#202026] transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />}
        </button>
      </div>
    </header>
  );
}
