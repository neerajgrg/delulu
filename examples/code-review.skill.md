---
name: code-review
description: "Inspect code for quality, edge cases, type safety, and security vulnerabilities."
trigger: "review"
tags: [code, review, quality, typescript, python]
model: claude-3-5-sonnet-20241022
temperature: 0.2
max_tokens: 2048
---

# Code Review Agent Skill

## Description
Autonomous code inspection skill that analyzes diffs and source files for logic bugs, missing error handlers, type inaccuracies, and security vulnerabilities.

## Examples

### Example 1
**Input:**
```typescript
function calculateDiscount(price, discount) {
  return price - price * discount;
}
```

**Output:**
- ⚠️ **Missing Types**: `price` and `discount` parameters should be typed as `number`.
- ⚠️ **Input Validation**: Missing bounds check for `discount < 0` or `discount > 1`.
- ✅ **Suggested Diff**:
```typescript
function calculateDiscount(price: number, discount: number): number {
  if (price < 0) throw new RangeError('Price cannot be negative');
  if (discount < 0 || discount > 1) throw new RangeError('Discount must be between 0.0 and 1.0');
  return price * (1 - discount);
}
```

## Constraints
- Always provide actionable, drop-in replacement diffs.
- Never output raw environment variables, API secrets, or passwords.
- Explain the rationale behind every warning or suggestion.
