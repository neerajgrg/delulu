import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import * as d3 from 'd3';
import { PlusIcon, RefreshIcon } from '../shared/Icons';

interface SkillMarkmapProps {
  content: string;
  className?: string;
}

const transformer = new Transformer();

/**
 * Transforms raw .skill.md content into an optimized Markmap markdown string.
 * It extracts YAML frontmatter and presents it as structured branches for the mindmap.
 */
function prepareMarkmapContent(raw: string): string {
  if (!raw.trim()) return '# Empty Skill';

  let frontmatterBlock = '';
  let body = raw;

  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    const yaml = fmMatch[1];
    body = fmMatch[2];

    const lines = yaml.split('\n').filter((l) => l.trim().length > 0);
    const fmItems = lines.map((l) => {
      const col = l.indexOf(':');
      if (col === -1) return `- ${l.trim()}`;
      const k = l.slice(0, col).trim();
      const v = l.slice(col + 1).trim().replace(/^["']|["']$/g, '');
      return `- **${k}**: \`${v}\``;
    });

    if (fmItems.length > 0) {
      frontmatterBlock = `## ⚙️ Metadata & Config\n${fmItems.join('\n')}\n\n`;
    }
  }

  // Find or create root heading
  const rootHeadingMatch = body.match(/^#\s+(.+)$/m);
  let mainTitle = rootHeadingMatch ? rootHeadingMatch[1] : 'AI Skill';

  // Clean body by removing the top h1 if present, so we control the tree root
  const cleanedBody = body.replace(/^#\s+.+$/m, '').trim();

  return `# ✦ ${mainTitle}\n\n${frontmatterBlock}${cleanedBody}`;
}

const SkillMarkmap: React.FC<SkillMarkmapProps> = ({ content, className = '' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formattedMarkdown = useMemo(() => prepareMarkmapContent(content), [content]);

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      const { root } = transformer.transform(formattedMarkdown);

      if (!markmapRef.current) {
        // Initialize Markmap instance
        markmapRef.current = Markmap.create(svgRef.current, {
          duration: 300,
          color: (node) => {
            const colors = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#38bdf8', '#a78bfa'];
            return colors[(node.state?.depth || 0) % colors.length];
          },
          paddingX: 16,
          autoFit: true,
          nodeMinHeight: 20,
          spacingVertical: 6,
          spacingHorizontal: 60,
        }, root);
      } else {
        // Update existing Markmap
        markmapRef.current.setData(root);
        markmapRef.current.fit();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate Markmap');
    }

    return () => {
      if (svgRef.current) {
        try {
          d3.select(svgRef.current).interrupt();
        } catch {
          // ignore
        }
      }
      if (markmapRef.current) {
        try {
          markmapRef.current.destroy?.();
        } catch {
          // ignore
        }
        markmapRef.current = null;
      }
    };
  }, [formattedMarkdown]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleFit = () => {
    if (markmapRef.current) {
      markmapRef.current.fit();
    }
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-base overflow-hidden select-none flex flex-col ${className}`}
    >
      {/* Floating Controls Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-surface-2/90 border border-line p-1 rounded-md shadow-md backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-3 text-ink-muted hover:text-ink text-xs transition-colors"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-3 text-ink-muted hover:text-ink text-xs transition-colors"
          title="Zoom out"
        >
          -
        </button>
        <div className="w-px h-3.5 bg-line mx-0.5" />
        <button
          onClick={handleFit}
          className="px-2 h-6 flex items-center gap-1 rounded hover:bg-surface-3 text-ink-muted hover:text-ink text-3xs font-mono transition-colors"
          title="Fit mindmap to view"
        >
          <RefreshIcon size={11} />
          <span>Fit View</span>
        </button>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-full text-err text-xs font-mono p-4">
          {error}
        </div>
      ) : (
        <svg
          ref={svgRef}
          className="w-full h-full markmap-svg"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />
      )}

      {/* Embedded Markmap Dark Theme Styles */}
      <style>{`
        .markmap-svg {
          background-color: #09090b;
        }
        .markmap-node text {
          fill: #f4f4f5 !important;
          font-family: 'Geist', 'Inter', -apple-system, sans-serif !important;
          font-size: 12px !important;
          letter-spacing: -0.01em !important;
        }
        .markmap-node circle {
          fill: #18181b !important;
          stroke-width: 2px !important;
          cursor: pointer;
        }
        .markmap-node circle:hover {
          fill: #6366f1 !important;
        }
        .markmap-link {
          stroke-opacity: 0.75 !important;
          stroke-width: 1.5px !important;
        }
        .markmap-node code {
          background: #18181b !important;
          color: #fbbf24 !important;
          padding: 1px 4px !important;
          border-radius: 3px !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 10.5px !important;
          border: 1px solid #27272a !important;
        }
        .markmap-node strong {
          color: #e4e4e7 !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
};

export default SkillMarkmap;
