import { useStore } from '../../store/useStore';
import SkillsExplorer from '../panels/SkillsExplorer';

export default function SidePanel() {
  const { panel, isSidebarOpen, view } = useStore();

  // Only show the sidebar when explicitly on the explorer panel and sidebar is open
  const show = isSidebarOpen && panel === 'explorer';
  if (!show) return null;

  return (
    <aside
      className="flex flex-col bg-surface border-r border-line overflow-hidden shrink-0 select-none transition-all duration-150 shadow-sm"
      style={{ width: 260 }}
      aria-label="Skills Explorer Sidebar"
    >
      <SkillsExplorer />
    </aside>
  );
}
