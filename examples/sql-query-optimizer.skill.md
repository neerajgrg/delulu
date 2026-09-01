---
name: sql-query-optimizer
description: "Analyze SQL queries for performance bottlenecks, missing indexes, and plan optimizations."
trigger: "sql-opt"
tags: [sql, postgres, mysql, performance, database]
model: claude-3-5-sonnet-20241022
temperature: 0.1
max_tokens: 2048
---

# SQL Query Optimizer

## Description
Examines SQL queries, explain plans, and table schemas to identify table scans, subquery anti-patterns, missing indexes, and recommend optimized query rewrites.

## Examples

### Example 1
**Input:**
```sql
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
```

**Output:**
- ⚠️ **Functional Index Required**: Wrapping `email` with `LOWER()` invalidates standard B-tree index on `email`, causing full table scan.
- ✅ **Recommended Optimization**:
```sql
-- Option A: Expression index
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- Option B: Case-insensitive collation / exact lookup
SELECT id, username, email, created_at FROM users WHERE email = 'alice@example.com';
```

## Constraints
- Avoid `SELECT *` in production recommendations.
- Always estimate index trade-offs on write throughput.
