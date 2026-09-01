import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateSkillMarkdown } from '../src/lib/skillMarkdown.ts';

describe('Skill Markdown & Frontmatter Generator', () => {
  it('should generate valid frontmatter and markdown sections', () => {
    const markdown = generateSkillMarkdown({
      templateId: 'custom',
      name: 'Weather API Helper',
      description: 'Fetch real-time weather forecasts.',
      trigger: 'weather',
      tags: ['weather', 'api'],
      examples: 'Input: forecast for Tokyo\nOutput: 22°C Sunny',
      constraints: 'Always specify units in Celsius.',
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.5,
      maxTokens: 1024,
    });

    assert.ok(markdown.startsWith('---'));
    assert.ok(markdown.includes('name: weather-api-helper'));
    assert.ok(markdown.includes('trigger: "weather"'));
    assert.ok(markdown.includes('tags: [weather, api]'));
    assert.ok(markdown.includes('# Weather API Helper'));
    assert.ok(markdown.includes('## Description'));
    assert.ok(markdown.includes('## Examples'));
    assert.ok(markdown.includes('## Constraints'));
  });
});
