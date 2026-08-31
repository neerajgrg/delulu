import type { ActivePanel, MainView } from '../../store/useStore';
import { useStore } from '../../store/useStore';
import {
  FileCodeIcon,
  SearchIcon,
  LibraryIcon,
  FlaskConicalIcon,
  SettingsIcon,
  BotIcon,
} from '../shared/Icons';

interface NavItem {
  id: ActivePanel;
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  view?: MainView;
}

export default function ActivityBar() {
  const { panel, setPanel, setView, isSidebarOpen, toggleSidebar, setCommandPaletteOpen } = useStore();

  const TOP_ITEMS: NavItem[] = [
    { id: 'explorer', icon: <FileCodeIcon size={20} />,       label: 'Explorer (⌘B)',                  },
    { id: 'home',     icon: <SearchIcon size={19} />,         label: 'Search (⌘F)'                     },
    { id: 'evals',    icon: <FlaskConicalIcon size={19} />,   label: 'Evals & Playground (⌘3)', view: 'evals' },
    { id: 'gallery',  icon: <LibraryIcon size={19} />,        label: 'Plugins & Templates (⌘2)', badge: '2', view: 'gallery' },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'home' || item.label.includes('Search')) {
      setCommandPaletteOpen(true);
      return;
    }
    if (panel === item.id && isSidebarOpen && !item.view) {
      toggleSidebar();
    } else {
      setPanel(item.id);
      if (!isSidebarOpen) toggleSidebar();
      if (item.view) setView(item.view);
    }
  };

  return (
    <nav
      className="flex flex-col items-center justify-between bg-[#18181c] border-r border-[#26262e] py-2 shrink-0 select-none z-20"
      style={{ width: 48 }}
      aria-label="Activity Bar"
    >
      {/* Top Section Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {TOP_ITEMS.map((item) => {
          const active = panel === item.id && isSidebarOpen;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              title={item.label}
              className={`
                relative w-full h-11 flex items-center justify-center transition-colors cursor-pointer group
                ${active ? 'text-white' : 'text-[#858591] hover:text-[#d1d1d8]'}
              `}
            >
              {/* VS Code active left indicator line */}
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#3b82f6]" />
              )}

              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#2563eb] text-white text-[9.5px] font-bold px-1 rounded-full border border-[#18181c]">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Section Icons (VS Code Accounts & Settings) */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Local Agent Profile */}
        <button
          onClick={() => {
            setView('settings');
          }}
          title="Local Agents & Accounts"
          className="relative w-full h-10 flex items-center justify-center text-[#858591] hover:text-[#d1d1d8] transition-colors cursor-pointer"
        >
          <div className="relative">
            <BotIcon size={18} />
            <span className="absolute -bottom-0.5 -right-1 w-2 h-2 rounded-full bg-[#10b981] border border-[#18181c]" />
          </div>
        </button>

        {/* Settings Gear */}
        <button
          onClick={() => {
            setView('settings');
          }}
          title="Settings (⌘,)"
          className="w-full h-10 flex items-center justify-center text-[#858591] hover:text-[#d1d1d8] transition-colors cursor-pointer"
        >
          <SettingsIcon size={19} />
        </button>
      </div>
    </nav>
  );
}
