import type { BuilderState } from '../types/delulu';

/**
 * Converts a raw name string into a URL-safe slug.
 * e.g. "My Cool Skill!" -> "my-cool-skill"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a slug or space-separated name into a human-readable title.
 * e.g. "code-review" -> "Code Review"
 */
function humanize(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generates a complete skill Markdown document from the given BuilderState.
 *
 * Structure:
 *  - YAML frontmatter (---)
 *  - # Title
 *  - ## Description
 *  - ## Examples
 *  - ## Constraints
 *  - ## Configuration
 */
export function generateSkillMarkdown(state: BuilderState): string {
  const slug = slugify(state.name) || 'untitled-skill';
  const title = humanize(state.name) || 'Untitled Skill';

  const tagsYaml =
    state.tags.length > 0
      ? `[${state.tags.map((t) => t.trim()).join(', ')}]`
      : '[]';

  const triggerLine =
    state.trigger.trim().length > 0
      ? `trigger: "${state.trigger.trim()}"`
      : null;

  const frontmatterLines = [
    '---',
    `name: ${slug}`,
    `description: "${state.description.replace(/"/g, '\\"')}"`,
    ...(triggerLine ? [triggerLine] : []),
    `tags: ${tagsYaml}`,
    `model: ${state.model}`,
    `temperature: ${state.temperature}`,
    `max_tokens: ${state.maxTokens}`,
    '---',
  ];

  const examplesBody =
    state.examples.trim().length > 0
      ? state.examples.trim()
      : '_No examples provided yet. Add input/output pairs to help the model understand the expected behavior._';

  const constraintsBody =
    state.constraints.trim().length > 0
      ? state.constraints.trim()
      : '_No constraints defined yet. Add rules the skill must follow._';

  const configSection = [
    '## Configuration',
    '',
    `- **Model**: \`${state.model}\``,
    `- **Temperature**: \`${state.temperature}\``,
    `- **Max Tokens**: \`${state.maxTokens}\``,
  ].join('\n');

  return [
    frontmatterLines.join('\n'),
    '',
    `# ${title}`,
    '',
    '## Description',
    '',
    state.description.trim() || '_No description provided._',
    '',
    '## Examples',
    '',
    examplesBody,
    '',
    '## Constraints',
    '',
    constraintsBody,
    '',
    configSection,
    '',
  ].join('\n');
}
