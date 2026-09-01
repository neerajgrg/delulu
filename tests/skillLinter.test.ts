import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSkillContent } from '../src/lib/skillLinter.ts';

describe('Skill Linter & Diagnostic Engine', () => {
  it('should return empty recommendations for empty content', () => {
    assert.deepStrictEqual(analyzeSkillContent(''), []);
  });

  it('should flag missing trigger in frontmatter', () => {
    const raw = `---
name: sample-skill
description: "A comprehensive sample description that exceeds minimum length."
---

# Sample Skill
`;
    const recs = analyzeSkillContent(raw);
    const triggerRec = recs.find((r) => r.id === 'missing-trigger');
    assert.ok(triggerRec, 'Should flag missing trigger');
    assert.strictEqual(triggerRec.severity, 'warning');

    // Test applyPatch
    const patched = triggerRec.applyPatch(raw);
    assert.ok(patched.includes('trigger: "run"'));
  });

  it('should flag missing few-shot examples', () => {
    const raw = `---
name: sample-skill
trigger: "sample"
description: "A comprehensive sample description that exceeds minimum length."
---

# Sample Skill
`;
    const recs = analyzeSkillContent(raw);
    const examplesRec = recs.find((r) => r.id === 'add-examples');
    assert.ok(examplesRec, 'Should flag missing examples');
  });
});
