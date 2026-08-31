import { useStore, type MainView } from '../../store/useStore';
import {
  PlusIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  SettingsIcon,
  FlaskConicalIcon,
  FileCodeIcon,
} from '../shared/Icons';
import DeluluLogo from '../shared/DeluluLogo';

export default function TitleBar() {
  const {
    view,
    theme,
    toggleTheme,
    setView,
    setCommandPaletteOpen,
    activeTab,
    setPanel,
  } = useStore();

  const activeFileName = activeTab ? activeTab.split('/').pop()?.replace(/\.skill\.md$/, '') : null;

  const navTabs: Array<{ id: MainView; label: string; icon?: React.ReactNode }> = [
    { id: 'welcome', label: 'Home' },
    { id: 'builder', label: 'New Skill', icon: <PlusIcon size={12} /> },
    { id: 'evals', label: 'Playground', icon: <FlaskConicalIcon size={12} /> },
    { id: 'gallery', label: 'Templates' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={12} /> },
  ];

  return (
    <header
      className="drag flex items-center justify-between bg-surface border-b border-line px-4 shrink-0 select-none"
      style={{ height: 44 }}
    >
      {/* Left: Window Controls & Brand */}
      <div className="no-drag flex items-center gap-4">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2 pr-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block opacity-90" />
        </div>

        <div className="h-4 w-px bg-line" />

        {/* Brand */}
        <button
          onClick={() => setView('welcome')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
        >
          <DeluluLogo size={20} showText={false} />
          <span className="font-bold tracking-tight text-ink text-sm font-display">
            Delulu
          </span>
        </button>

        {activeFileName && view === 'editor' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-line text-xs font-medium text-ink-2 truncate max-w-44">
            <FileCodeIcon size={13} className="text-accent-bright" />
            <span>{activeFileName}</span>
          </div>
        )}
      </div>

      {/* Center: Clean 1-Click Primary Navigation Tabs */}
      <div className="no-drag flex items-center gap-1 bg-base p-1 rounded-xl border border-line shadow-inner">
        {navTabs.map((tab) => {
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setView(tab.id);
                if (tab.id === 'builder') setPanel('explorer');
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer
                ${isActive
                  ? 'bg-surface-3 text-ink font-semibold shadow-sm border border-line-bright'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2'}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Search & Theme Toggle */}
      <div className="no-drag flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-base border border-line hover:border-line-bright text-ink-dim hover:text-ink-muted text-xs transition-all cursor-pointer"
        >
          <SearchIcon size={12} className="text-ink-dim" />
          <span className="text-2xs">Search…</span>
          <kbd className="font-mono text-3xs bg-surface-3 px-1.5 py-0.2 rounded text-ink-dim border border-line">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="btn-ghost p-1.5 text-ink-dim hover:text-ink rounded-lg"
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {theme === 'dark' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>
      </div>
    </header>
  );
}
