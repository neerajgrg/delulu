import { useStore } from '../../store/useStore';
import QualityStars from '../shared/QualityStars';
import { FolderIcon, FlaskConicalIcon } from '../shared/Icons';
import DeluluLogo from '../shared/DeluluLogo';
import { analyzeSkillTokens } from '../../lib/tokenCounter';

export default function StatusBar() {
  const {
    tabs,
    activeTab,
    skills,
    workspaceFolder,
    settings,
    detectedAgents,
    setView,
    toggleBottomConsole,
    setBottomConsoleTab,
    isBottomConsoleOpen,
  } = useStore();

  const tab = tabs.find((t) => t.path === activeTab);
  const skill = skills.find((s) => s.path === activeTab);
  const folderName = workspaceFolder?.split('/').pop() || 'workspace';

  const activeProvider = settings.activeProvider || 'claude';
  const activeAgent = detectedAgents.find((a) => a.id === activeProvider);
  const isAgentActive = !!(activeAgent?.detected || activeAgent?.hasSession || settings.claudeApiKey || settings.geminiApiKey);

  return (
    <footer
      className="flex items-center justify-between bg-surface border-t border-line px-3 shrink-0 text-3xs font-mono text-ink-dim select-none z-30"
      style={{ height: 24 }}
      aria-label="Status Bar"
    >
      {/* Left items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-ink-muted">
          <DeluluLogo size={13} showText={false} />
          <span className="font-semibold text-ink font-sans tracking-tight text-3xs">delulu</span>
        </span>

        {skill && (
          <div className="flex items-center gap-1.5 border-l border-line pl-3">
            <QualityStars quality={skill.quality} size="sm" />
            <span className="text-ink-muted font-medium">{skill.quality}/5</span>
          </div>
        )}

        {tab?.isDirty && (
          <span className="flex items-center gap-1 text-warn font-medium border-l border-line pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            <span>Unsaved</span>
          </span>
        )}

        {/* Local Agent & Session Indicator */}
        <button
          onClick={() => setView('settings')}
          className="flex items-center gap-1 border-l border-line pl-3 hover:text-ink transition-colors cursor-pointer"
          title="Click to manage local agents and sessions in Settings"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAgentActive ? 'bg-ok' : 'bg-ink-dim'
            }`}
          />
          <span className={isAgentActive ? 'text-ok font-medium' : 'text-ink-dim'}>
            {activeAgent?.name ? `${activeAgent.name} (Local)` : 'No Agent Active'}
          </span>
        </button>

        {/* Console / REPL Toggle button */}
        <button
          onClick={() => {
            setBottomConsoleTab('repl');
          }}
          className={`flex items-center gap-1 border-l border-line pl-3 hover:text-ink transition-colors ${
            isBottomConsoleOpen ? 'text-accent-bright font-semibold' : ''
          }`}
          title="Toggle Skill REPL & Problems Console (⌘J)"
        >
          <FlaskConicalIcon size={11} />
          <span>Console (⌘J)</span>
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 truncate max-w-40" title={workspaceFolder || ''}>
          <FolderIcon size={11} className="text-ink-dim" />
          <span>{folderName}</span>
        </span>

        <span className="border-l border-line pl-3">
          {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
        </span>

        <span className="border-l border-line pl-3">
          UTF-8
        </span>

        {tab && (
          <>
            <span
              className="border-l border-line pl-3 text-ink hover:text-accent-bright transition-colors cursor-help"
              title={`Estimated Token Count: ~${analyzeSkillTokens(tab.content).totalTokens.toLocaleString()} tokens\nWords: ${analyzeSkillTokens(tab.content).words}\nCharacters: ${analyzeSkillTokens(tab.content).characters}\nContext Window Budget: ${analyzeSkillTokens(tab.content).contextPercentage}% of 128k`}
            >
              ⚡ ~{analyzeSkillTokens(tab.content).totalTokens.toLocaleString()} tokens
            </span>
            <span className="border-l border-line pl-3 text-accent-bright font-medium">
              skill.md
            </span>
          </>
        )}
      </div>
    </footer>
  );
}
