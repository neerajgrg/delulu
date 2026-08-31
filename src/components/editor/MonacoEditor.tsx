import React, { useRef, useCallback, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { loader, type OnMount } from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { SparklesIcon } from '../shared/Icons';

// Graceful local worker environment (never fails on network/CDN)
if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker: function () {
      const blob = new Blob([''], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    },
  };
}

// Pass bundled monaco directly to @monaco-editor/react
loader.config({ monaco });

interface MonacoEditorProps {
  filePath: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onSave?: () => void;
}

function detectLanguage(filePath: string): string {
  const p = filePath.toLowerCase();
  if (p.endsWith('.skill.md') || p.endsWith('skill.md')) return 'skillmd';
  if (p.endsWith('.md') || p.endsWith('.markdown')) return 'markdown';
  if (p.endsWith('.ts') || p.endsWith('.tsx')) return 'typescript';
  if (p.endsWith('.js') || p.endsWith('.jsx')) return 'javascript';
  if (p.endsWith('.py')) return 'python';
  if (p.endsWith('.json')) return 'json';
  if (p.endsWith('.yaml') || p.endsWith('.yml')) return 'yaml';
  if (p.endsWith('.sh') || p.endsWith('.bash') || p.endsWith('.zsh')) return 'shell';
  if (p.endsWith('.html')) return 'html';
  if (p.endsWith('.css')) return 'css';
  return 'markdown';
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  value,
  onChange,
  onSave,
}) => {
  const { settings, theme } = useStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback(
    (editor, m) => {
      editorRef.current = editor;

      try {
        // ── Register custom 'skillmd' language ───────────────────────────────
        if (!m.languages.getLanguages().some((l: { id: string }) => l.id === 'skillmd')) {
          m.languages.register({ id: 'skillmd', extensions: ['.md', '.mdx'] });

          m.languages.setMonarchTokensProvider('skillmd', {
            defaultToken: '',
            tokenizer: {
              root: [
                [/^---\s*$/, { token: 'keyword.control', next: '@frontmatter' }],
                [/^#{1,6}\s.*$/, 'markup.heading'],
                [/\*\*[^*]+\*\*/, 'markup.bold'],
                [/\*[^*]+\*/, 'markup.italic'],
                [/^```.*$/, { token: 'markup.fenced_code.block', next: '@codeBlock' }],
                [/`[^`]+`/, 'markup.inline.raw'],
                [/\[([^\]]*)\]\(([^)]*)\)/, 'markup.underline.link'],
              ],
              frontmatter: [
                [/^---\s*$/, { token: 'keyword.control', next: '@pop' }],
                [/^[a-zA-Z_][\w-]*\s*(?=:)/, 'type.identifier'],
                [/:/, 'delimiter'],
                [/".*?"/, 'string'],
                [/'.*?'/, 'string'],
                [/\b(true|false)\b/, 'constant.language'],
                [/\b\d+(\.\d+)?\b/, 'number'],
                [/\[.*?\]/, 'variable.other'],
              ],
              codeBlock: [
                [/^```\s*$/, { token: 'markup.fenced_code.block', next: '@pop' }],
                [/.*$/, 'variable.source'],
              ],
            },
          });
        }

        // ── Define 'delulu-dark' theme ────────────────────────────────────────
        m.editor.defineTheme('delulu-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword.control', foreground: '818cf8', fontStyle: 'bold' },
            { token: 'type.identifier', foreground: 'a5b4fc', fontStyle: 'bold' },
            { token: 'markup.heading', foreground: 'f4f4f5', fontStyle: 'bold' },
            { token: 'markup.bold', foreground: 'e4e4e7', fontStyle: 'bold' },
            { token: 'markup.italic', foreground: 'd4d4d8', fontStyle: 'italic' },
            { token: 'markup.inline.raw', foreground: 'fbbf24' },
            { token: 'markup.fenced_code.block', foreground: '6366f1' },
            { token: 'string', foreground: '34d399' },
            { token: 'number', foreground: 'fbbf24' },
            { token: 'constant.language', foreground: 'f472b6' },
            { token: 'markup.underline.link', foreground: '38bdf8', fontStyle: 'underline' },
            { token: 'variable.other', foreground: 'a1a1aa' },
            { token: 'variable.source', foreground: 'd4d4d8' },
          ],
          colors: {
            'editor.background': '#09090b',
            'editor.foreground': '#f4f4f5',
            'editor.lineHighlightBackground': '#18181b',
            'editor.selectionBackground': '#6366f133',
            'editor.selectionHighlightBackground': '#6366f120',
            'editorLineNumber.foreground': '#3f3f46',
            'editorLineNumber.activeForeground': '#a1a1aa',
            'editorCursor.foreground': '#818cf8',
            'editorWhitespace.foreground': '#27272a',
            'editorIndentGuide.background': '#18181b',
            'editorIndentGuide.activeBackground': '#27272a',
            'editorGutter.background': '#09090b',
          },
        });

        // ── Define 'delulu-light' theme ────────────────────────────────────────
        m.editor.defineTheme('delulu-light', {
          base: 'vs',
          inherit: true,
          rules: [
            { token: 'keyword.control', foreground: '4f46e5', fontStyle: 'bold' },
            { token: 'type.identifier', foreground: '4338ca', fontStyle: 'bold' },
            { token: 'markup.heading', foreground: '09090b', fontStyle: 'bold' },
            { token: 'markup.inline.raw', foreground: 'd97706' },
            { token: 'string', foreground: '059669' },
            { token: 'number', foreground: 'd97706' },
          ],
          colors: {
            'editor.background': '#f8fafc',
            'editor.foreground': '#0f172a',
            'editor.lineHighlightBackground': '#f1f5f9',
            'editor.selectionBackground': '#6366f120',
            'editorLineNumber.foreground': '#94a3b8',
            'editorLineNumber.activeForeground': '#0f172a',
            'editorCursor.foreground': '#4f46e5',
          },
        });

        m.editor.setTheme(theme === 'light' ? 'delulu-light' : 'delulu-dark');

        // ── Cmd+S shortcut ───────────────────────────────────────────────────
        editor.addCommand(
          m.KeyMod.CtrlCmd | m.KeyCode.KeyS,
          () => {
            onSave?.();
          }
        );
      } catch {
        // ignore
      }
    },
    [onSave, theme]
  );

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme === 'light' ? 'delulu-light' : 'delulu-dark');
    }
  }, [theme]);

  const lang = detectLanguage(filePath);

  return (
    <div className="w-full h-full relative overflow-hidden bg-base">
      <Editor
        height="100%"
        language={lang}
        value={value}
        theme={theme === 'light' ? 'delulu-light' : 'delulu-dark'}
        onChange={onChange}
        onMount={handleMount}
        loading={
          <div className="flex items-center justify-center h-full bg-base text-ink-dim text-xs font-mono gap-2">
            <SparklesIcon size={14} className="text-accent animate-spin" />
            <span>Loading editor…</span>
          </div>
        }
        options={{
          fontSize: settings.fontSize,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures: settings.fontLigatures,
          wordWrap: 'on',
          minimap: { enabled: false },
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 5,
            horizontalScrollbarSize: 5,
            vertical: 'auto',
            horizontal: 'auto',
          },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
