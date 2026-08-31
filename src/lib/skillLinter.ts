export interface SkillRecommendation {
  id: string;
  type: 'security' | 'examples' | 'constraints' | 'frontmatter' | 'clarity' | 'optimization';
  severity: 'tip' | 'warning' | 'info';
  title: string;
  description: string;
  actionLabel: string;
  suggestedPatch: string;
  applyPatch: (currentContent: string) => string;
}

/**
 * Analyzes skill content and produces actionable inline recommendations
 */
export function analyzeSkillContent(content: string): SkillRecommendation[] {
  const recs: SkillRecommendation[] = [];
  if (!content || !content.trim()) return recs;

  const hasFrontmatter = /^---\r?\n[\s\S]*?\r?\n---/.test(content);
  const hasExamples = /##\s*Examples/i.test(content);
  const hasConstraints = /##\s*Constraints/i.test(content);
  const hasTrigger = /trigger:\s*["']?[a-z0-9_-]+["']?/i.test(content);
  const hasDescription = /description:\s*["']?.{20,}["']?/i.test(content);

  // 1. Missing Trigger Keyword
  if (hasFrontmatter && !hasTrigger) {
    recs.push({
      id: 'missing-trigger',
      type: 'frontmatter',
      severity: 'warning',
      title: 'Missing Trigger Keyword',
      description: 'Add a slash-command trigger keyword so AI agents and users can summon this skill instantly (e.g. /review or /analyze).',
      actionLabel: 'Add Trigger (/skill)',
      suggestedPatch: 'trigger: "run"',
      applyPatch: (current) => {
        return current.replace(/^name:\s*(.+)$/m, 'name: $1\ntrigger: "run"');
      },
    });
  }

  // 2. Missing Concrete Examples
  if (!hasExamples || (content.match(/##\s*Examples([\s\S]*?)(?=##|$)/i)?.[1]?.trim().length ?? 0) < 30) {
    recs.push({
      id: 'add-examples',
      type: 'examples',
      severity: 'warning',
      title: 'Add Concrete Input/Output Examples',
      description: 'Few-shot examples drastically improve instruction following and output formatting consistency across all LLMs.',
      actionLabel: 'Inject Few-Shot Examples',
      suggestedPatch: `## Examples\n\n### Example 1\n**Input:**\nProvide sample task input here.\n\n**Output:**\n- Expected clean output format.\n- Clear demonstration of expected behavior.`,
      applyPatch: (current) => {
        if (/##\s*Examples/i.test(current)) {
          return current.replace(
            /##\s*Examples[\s\S]*?(?=##\s*Constraints|##\s*Configuration|$)/i,
            `## Examples\n\n### Example 1\n**Input:**\nProvide sample task input here.\n\n**Output:**\n- Expected clean structured output.\n- Follows formatting rules strictly.\n\n`
          );
        }
        return current + `\n\n## Examples\n\n### Example 1\n**Input:**\nProvide sample task input here.\n\n**Output:**\n- Expected clean structured output.\n- Follows formatting rules strictly.\n`;
      },
    });
  }

  // 3. Missing Guardrails / Constraints
  if (!hasConstraints || (content.match(/##\s*Constraints([\s\S]*?)(?=##|$)/i)?.[1]?.trim().length ?? 0) < 20) {
    recs.push({
      id: 'add-constraints',
      type: 'constraints',
      severity: 'tip',
      title: 'Add Negative Constraints & Guardrails',
      description: 'Explicit negative constraints ("Never do X", "Do not modify signatures") prevent hallucinations and unwanted side effects.',
      actionLabel: 'Add Security Guardrails',
      suggestedPatch: `## Constraints\n- Never reveal secret keys, passwords, or authentication tokens.\n- Do not execute destructive filesystem commands without confirmation.\n- Maintain deterministic output formats.`,
      applyPatch: (current) => {
        if (/##\s*Constraints/i.test(current)) {
          return current.replace(
            /##\s*Constraints[\s\S]*?(?=##\s*Configuration|$)/i,
            `## Constraints\n- Never reveal secret keys, passwords, or authentication tokens.\n- Do not execute destructive or irreversible commands.\n- Adhere strictly to the requested format.\n\n`
          );
        }
        return current + `\n\n## Constraints\n- Never reveal secret keys, passwords, or authentication tokens.\n- Do not execute destructive or irreversible commands.\n- Adhere strictly to the requested format.\n`;
      },
    });
  }

  // 4. Optimization: Temperature Tuning for Code / Analysis
  const tempMatch = content.match(/temperature:\s*([0-9.]+)/);
  if (tempMatch && parseFloat(tempMatch[1]) > 0.5) {
    recs.push({
      id: 'tune-temperature',
      type: 'optimization',
      severity: 'info',
      title: 'Lower Temperature for Deterministic Tasks',
      description: `Current temperature is ${tempMatch[1]}. Lowering it to 0.2 improves precision for technical analysis and coding tasks.`,
      actionLabel: 'Set Temperature to 0.2',
      suggestedPatch: 'temperature: 0.2',
      applyPatch: (current) => {
        return current.replace(/temperature:\s*[0-9.]+/, 'temperature: 0.2');
      },
    });
  }

  // 5. Short Description Warning
  if (!hasDescription) {
    recs.push({
      id: 'expand-description',
      type: 'clarity',
      severity: 'tip',
      title: 'Elaborate Skill Description',
      description: 'Descriptions under 20 characters make it harder for semantic routing agents to know when to summon this skill.',
      actionLabel: 'Enrich Description',
      suggestedPatch: 'description: "Comprehensive skill for automated code analysis, reviewing edge cases, and enforcing team standards."',
      applyPatch: (current) => {
        return current.replace(
          /description:\s*["'].*?["']/,
          'description: "Comprehensive skill for automated code analysis, reviewing edge cases, and enforcing team standards."'
        );
      },
    });
  }

  return recs;
}
