import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSkillTokens } from '../src/lib/tokenCounter.ts';

describe('Token Budgeting Engine', () => {
  it('should accurately count empty or minimal content', () => {
    const res = analyzeSkillTokens('');
    assert.strictEqual(res.totalTokens, 0);
    assert.strictEqual(res.contextPercentage, 0);
  });

  it('should compute token statistics for standard skill markdown with code block', () => {
    const sample = `---
name: code-review
description: "Inspect code for quality."
trigger: "review"
tags: [code, review]
---

# Code Review

\`\`\`typescript
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`
`;
    const res = analyzeSkillTokens(sample);
    assert.ok(res.totalTokens > 0, 'Total tokens should be greater than 0');
    assert.ok(res.totalTokens < 200, 'Total tokens should be under 200 for short snippet');
    assert.ok(typeof res.contextPercentage === 'number');
    assert.ok(typeof res.estimatedCostPer1kCalls === 'number');
    assert.ok(res.breakdown.frontmatterTokens > 0);
    assert.ok(res.breakdown.codeBlockTokens > 0);
  });

  it('should differentiate code block token density from prose', () => {
    const codeBlock = '```ts\nconst x = 1;\n```';
    const res = analyzeSkillTokens(codeBlock);
    assert.ok(res.breakdown.codeBlockTokens > 0);
  });
});
