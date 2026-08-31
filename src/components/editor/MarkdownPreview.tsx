import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownPreviewProps {
  content: string;
}

interface FrontmatterField {
  key: string;
  value: string;
}

function parseFrontmatter(raw: string): { fields: FrontmatterField[]; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fields: [], body: raw };

  const yamlLines = match[1].split('\n');
  const fields: FrontmatterField[] = [];

  for (const line of yamlLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fields.push({ key, value });
  }

  return { fields, body: match[2] };
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const { fields, body } = useMemo(() => parseFrontmatter(content), [content]);

  const htmlBody = useMemo(() => {
    try {
      return marked.parse(body, { gfm: true, breaks: true }) as string;
    } catch {
      return '<p class="text-err">Failed to render markdown preview.</p>';
    }
  }, [body]);

  return (
    <div className="h-full overflow-y-auto bg-base px-6 py-5 select-text">
      {/* YAML Frontmatter Badge Card */}
      {fields.length > 0 && (
        <div className="mb-5 rounded-md border border-line bg-surface-2/70 overflow-hidden font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-line bg-surface-3">
            <span className="text-3xs uppercase tracking-wider font-semibold text-ink-dim">
              Skill Metadata
            </span>
            <span className="text-3xs text-accent-bright font-medium">YAML</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {fields.map(({ key, value }) => (
              <div key={key} className="flex items-baseline gap-2 min-w-0">
                <span className="text-3xs text-ink-dim font-medium uppercase tracking-wider shrink-0">
                  {key}:
                </span>
                <span className="text-xs text-accent-bright font-mono truncate" title={value}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markdown Document Content */}
      <div
        className="delulu-markdown selectable"
        dangerouslySetInnerHTML={{ __html: htmlBody }}
      />

      <style>{`
        .delulu-markdown {
          color: var(--text-ink);
          font-family: 'Geist', 'Inter', sans-serif;
          font-size: 13px;
          line-height: 1.65;
          letter-spacing: -0.01em;
          max-width: 740px;
        }
        .delulu-markdown h1 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-ink);
          letter-spacing: -0.02em;
          margin: 16px 0 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-line);
        }
        .delulu-markdown h2 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-ink-2);
          letter-spacing: -0.01em;
          margin: 16px 0 6px;
        }
        .delulu-markdown h3 {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-ink-muted);
          margin: 12px 0 4px;
        }
        .delulu-markdown p {
          margin: 0 0 10px;
          color: var(--text-ink-2);
        }
        .delulu-markdown strong {
          color: var(--text-ink);
          font-weight: 600;
        }
        .delulu-markdown code {
          background: var(--bg-surface-2);
          color: #d97706;
          padding: 2px 5px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          border: 1px solid var(--border-line);
        }
        .delulu-markdown pre {
          background: var(--bg-surface);
          border: 1px solid var(--border-line);
          border-left: 2px solid var(--accent);
          border-radius: 6px;
          padding: 12px 14px;
          margin: 10px 0;
          overflow-x: auto;
        }
        .delulu-markdown pre code {
          background: none;
          border: none;
          padding: 0;
          color: var(--text-ink);
          font-size: 12px;
          line-height: 1.5;
        }
        .delulu-markdown ul, .delulu-markdown ol {
          padding-left: 20px;
          margin: 0 0 10px;
          color: var(--text-ink-2);
        }
        .delulu-markdown li {
          margin: 3px 0;
        }
        .delulu-markdown blockquote {
          border-left: 2px solid var(--border-line-bright);
          padding-left: 12px;
          margin: 10px 0;
          color: var(--text-ink-muted);
          font-style: normal;
        }
        .delulu-markdown a {
          color: var(--accent-bright);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default MarkdownPreview;
