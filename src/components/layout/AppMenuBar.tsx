import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import {
  FolderIcon,
  PlusIcon,
  SaveIcon,
  XIcon,
  SearchIcon,
  FlaskConicalIcon,
  LibraryIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  BotIcon,
  BookOpenIcon,
} from '../shared/Icons';

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  divider?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AppMenuBar() {
  const {
    setView,
    setPanel,
    toggleSidebar,
    toggleBottomConsole,
    setCommandPaletteOpen,
    toggleTheme,
    theme,
    activeTab,
    saveTab,
    closeTab,
    setWorkspaceFolder,
  } = useStore();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenFolder = async () => {
    const folder = await window.deluluAPI.openFolder();
    if (folder) setWorkspaceFolder(folder);
  };

  const menuSections: MenuSection[] = [
    {
      title: 'File',
      items: [
        {
          id: 'new-skill',
          label: 'New Skill File…',
          shortcut: '⌘N',
          icon: <PlusIcon size={14} />,
          onClick: () => {
            setView('builder');
            setPanel('explorer');
          },
        },
        {
          id: 'open-folder',
          label: 'Open Workspace Folder…',
          shortcut: '⌘O',
          icon: <FolderIcon size={14} />,
          onClick: handleOpenFolder,
        },
        {
          id: 'save-file',
          label: 'Save Active Skill',
          shortcut: '⌘S',
          icon: <SaveIcon size={14} />,
          disabled: !activeTab,
          onClick: () => {
            if (activeTab) saveTab(activeTab);
          },
        },
        {
          id: 'close-tab',
          label: 'Close Active Tab',
          shortcut: '⌘W',
          icon: <XIcon size={14} />,
          disabled: !activeTab,
          onClick: () => {
            if (activeTab) closeTab(activeTab);
          },
        },
        { id: 'div-file-1', label: '', divider: true },
        {
          id: 'import-skill',
          label: 'Import / Symlink Skill…',
          onClick: () => setView('welcome'),
        },
        { id: 'div-file-2', label: '', divider: true },
        {
          id: 'reload-window',
          label: 'Reload IDE Window',
          shortcut: '⌘R',
          onClick: () => window.location.reload(),
        },
      ],
    },
    {
      title: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          shortcut: '⌘Z',
          onClick: () => document.execCommand('undo'),
        },
        {
          id: 'redo',
          label: 'Redo',
          shortcut: '⌘⇧Z',
          onClick: () => document.execCommand('redo'),
        },
        { id: 'div-edit-1', label: '', divider: true },
        {
          id: 'cut',
          label: 'Cut',
          shortcut: '⌘X',
          onClick: () => document.execCommand('cut'),
        },
        {
          id: 'copy',
          label: 'Copy',
          shortcut: '⌘C',
          onClick: () => document.execCommand('copy'),
        },
        {
          id: 'paste',
          label: 'Paste',
          shortcut: '⌘V',
          onClick: () => document.execCommand('paste'),
        },
        { id: 'div-edit-2', label: '', divider: true },
        {
          id: 'find-search',
          label: 'Search Skills & Commands',
          shortcut: '⌘K',
          icon: <SearchIcon size={14} />,
          onClick: () => setCommandPaletteOpen(true),
        },
      ],
    },
    {
      title: 'View',
      items: [
        {
          id: 'view-welcome',
          label: 'Welcome & Dashboard',
          shortcut: '⌘1',
          onClick: () => setView('welcome'),
        },
        {
          id: 'view-editor',
          label: 'Skill Editor',
          shortcut: '⌘2',
          disabled: !activeTab,
          onClick: () => setView('editor'),
        },
        {
          id: 'view-evals',
          label: 'AI Evals & Playground',
          shortcut: '⌘3',
          icon: <FlaskConicalIcon size={14} />,
          onClick: () => setView('evals'),
        },
        {
          id: 'view-gallery',
          label: 'Templates & Plugins Gallery',
          shortcut: '⌘4',
          icon: <LibraryIcon size={14} />,
          onClick: () => setView('gallery'),
        },
        {
          id: 'view-settings',
          label: 'Settings & Local Agents',
          shortcut: '⌘,',
          icon: <SettingsIcon size={14} />,
          onClick: () => setView('settings'),
        },
        {
          id: 'view-docs',
          label: 'Developer Documentation',
          shortcut: '⌘D',
          icon: <BookOpenIcon size={14} />,
          onClick: () => setView('docs'),
        },
        { id: 'div-view-1', label: '', divider: true },
        {
          id: 'toggle-sidebar',
          label: 'Toggle Primary Sidebar',
          shortcut: '⌘B',
          onClick: toggleSidebar,
        },
        {
          id: 'toggle-console',
          label: 'Toggle Bottom Console',
          shortcut: '⌘J',
          onClick: toggleBottomConsole,
        },
        { id: 'div-view-2', label: '', divider: true },
        {
          id: 'toggle-theme',
          label: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
          icon: theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />,
          onClick: toggleTheme,
        },
      ],
    },
    {
      title: 'Skill',
      items: [
        {
          id: 'skill-test',
          label: 'Test Active Skill in Playground',
          shortcut: '⌘⏎',
          icon: <FlaskConicalIcon size={14} />,
          disabled: !activeTab,
          onClick: () => setView('evals'),
        },
        {
          id: 'skill-builder',
          label: 'Author New Skill (1-Step)',
          shortcut: '⌘N',
          icon: <PlusIcon size={14} />,
          onClick: () => setView('builder'),
        },
        { id: 'div-skill-1', label: '', divider: true },
        {
          id: 'skill-agents',
          label: 'Detected Agent Runtimes',
          icon: <BotIcon size={14} />,
          onClick: () => setView('settings'),
        },
      ],
    },
    {
      title: 'Window',
      items: [
        {
          id: 'win-fullscreen',
          label: 'Toggle Fullscreen',
          shortcut: 'F11',
          onClick: () => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          },
        },
        {
          id: 'win-minimize',
          label: 'Minimize Viewport',
          onClick: () => {},
        },
        {
          id: 'win-zoom',
          label: 'Zoom / Reset Layout',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Help',
      items: [
        {
          id: 'help-welcome',
          label: 'Delulu Documentation & Quickstart',
          onClick: () => window.open('https://neerajgrg.github.io/delulu/docs/', '_blank'),
        },
        {
          id: 'help-shortcuts',
          label: 'Keyboard Shortcuts Reference',
          shortcut: '⌘K',
          onClick: () => setCommandPaletteOpen(true),
        },
        { id: 'div-help-1', label: '', divider: true },
        {
          id: 'help-about',
          label: 'About Delulu AI Skill Studio v0.1.0',
          onClick: () => alert('Delulu AI Skill Studio v0.1.0\nAuthor, benchmark, and deploy skills across AI agents.'),
        },
      ],
    },
  ];

  return (
    <div ref={menuBarRef} className="flex items-center gap-0.5 relative select-none font-sans text-xs">
      {menuSections.map((section) => {
        const isOpen = openMenu === section.title;
        return (
          <div key={section.title} className="relative">
            <button
              onClick={() => setOpenMenu(isOpen ? null : section.title)}
              onMouseEnter={() => {
                if (openMenu !== null) {
                  setOpenMenu(section.title);
                }
              }}
              className={`
                px-2 py-1 rounded transition-colors cursor-pointer text-xs font-normal
                ${isOpen ? 'bg-[#2a2d3d] text-white' : 'text-[#858591] hover:text-[#d1d1d8] hover:bg-[#202026]'}
              `}
            >
              {section.title}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-64 bg-[#1e1e24] border border-[#2e2e38] rounded-lg shadow-2xl py-1.5 z-50 animate-fade-in backdrop-blur-md"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                }}
              >
                {section.items.map((item) => {
                  if (item.divider) {
                    return <div key={item.id} className="h-px bg-[#2e2e38] my-1 mx-2" />;
                  }

                  return (
                    <button
                      key={item.id}
                      disabled={item.disabled}
                      onClick={() => {
                        setOpenMenu(null);
                        item.onClick?.();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer
                        ${
                          item.disabled
                            ? 'opacity-40 cursor-not-allowed text-[#858591]'
                            : 'text-[#cccccc] hover:bg-[#2a2d3d] hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <span className="text-[#858591]">{item.icon}</span>}
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="text-[10px] text-[#858591] font-mono tracking-wider ml-4">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
