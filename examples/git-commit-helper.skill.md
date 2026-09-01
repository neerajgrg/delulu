---
name: git-commit-helper
description: "Generate structured, Conventional Commits messages from staged git diffs."
trigger: "commit"
tags: [git, commits, devops, productivity]
model: claude-3-5-sonnet-20241022
temperature: 0.3
max_tokens: 1024
---

# Git Commit Helper

## Description
Analyzes git diffs and creates clean, structured commit messages adhering to the Conventional Commits 1.0.0 specification (feat, fix, docs, refactor, perf, test, chore).

## Examples

### Example 1
**Input:**
```diff
+ export function countTokens(text: string): number {
+   return Math.ceil(text.length / 4.0);
+ }
```

**Output:**
```text
feat(tokenizer): add BPE token count estimation utility

Introduces countTokens() to compute real-time token density for prompt budgeting.
```

## Constraints
- Keep commit title under 72 characters.
- Use imperative, present tense ("add" not "added").
- Include concise body when non-trivial rationale is involved.
