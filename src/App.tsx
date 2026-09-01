import { useState, useEffect } from 'react';
import { useStore, type MainView } from './store/useStore';
import TitleBar from './components/layout/TitleBar';
import ActivityBar from './components/layout/ActivityBar';
import SidePanel from './components/layout/SidePanel';
import StatusBar from './components/layout/StatusBar';
import CommandPalette from './components/layout/CommandPalette';
import BottomConsole from './components/layout/BottomConsole';
import WelcomeView from './components/views/WelcomeView';
import EditorView from './components/views/EditorView';
import SkillBuilder from './components/views/SkillBuilder';
import GalleryView from './components/views/GalleryView';
import EvalsView from './components/views/EvalsView';
import AgentsView from './components/views/AgentsView';
import SettingsView from './components/views/SettingsView';
import DocsView from './components/views/DocsView';
import ShortcutsModal from './components/modals/ShortcutsModal';

export default function App() {
  const {
    init,
    view,
    setView,
    toggleSidebar,
    toggleBottomConsole,
    setCommandPaletteOpen,
    isCommandPaletteOpen,
  } = useStore();

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  // Global Keyboard Shortcuts (Cursor / VS Code muscle memory)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘K or ⌘P -> Command Palette
      if (isMeta && (e.key === 'k' || e.key === 'p')) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // ⌘/ or ⌘? -> Shortcuts Reference
      if (isMeta && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // ⌘B -> Toggle Sidebar
      if (isMeta && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // ⌘J -> Toggle Bottom Console
      if (isMeta && e.key === 'j') {
        e.preventDefault();
        toggleBottomConsole();
        return;
      }

      // ⌘N -> New Skill Wizard
      if (isMeta && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        setView('builder');
        return;
      }

      // ⌘D -> Developer Docs
      if (isMeta && e.key === 'd' && !e.shiftKey) {
        e.preventDefault();
        setView('docs');
        return;
      }

      // ⌘, -> Settings & AI Agents
      if (isMeta && e.key === ',') {
        e.preventDefault();
        setView('settings');
        return;
      }

      // ⌘1 .. ⌘5 -> Switch Main Views
      if (isMeta && !e.shiftKey) {
        const viewMap: Record<string, MainView> = {
          '1': 'welcome',
          '2': 'editor',
          '3': 'evals',
          '4': 'gallery',
          '5': 'settings',
        };
        if (viewMap[e.key]) {
          e.preventDefault();
          setView(viewMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    toggleSidebar,
    toggleBottomConsole,
    setView,
  ]);

  return (
    <div className="flex flex-col h-full bg-base text-ink overflow-hidden select-none font-sans">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <SidePanel />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden">
            {view === 'welcome'  && <WelcomeView />}
            {view === 'editor'   && <EditorView />}
            {view === 'builder'  && <SkillBuilder />}
            {view === 'gallery'  && <GalleryView />}
            {view === 'evals'    && <EvalsView />}
            {view === 'agents'   && <AgentsView />}
            {view === 'settings' && <SettingsView />}
            {view === 'docs'     && <DocsView />}
          </main>

          {/* Bottom Console Drawer */}
          <BottomConsole />
        </div>
      </div>

      <StatusBar />

      {/* Global Command Palette Modal */}
      <CommandPalette />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
