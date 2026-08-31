import type { SkillTemplate } from '../types/delulu';

export const SKILL_TEMPLATES: SkillTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    icon: '🔍',
    tags: ['code', 'review', 'quality'],
    trigger: 'review',
    description: 'Inspect code and report findings',
    exampleContent: `### Example 1

**Input:**
\`\`\`typescript
function add(a, b) {
  return a + b;
}
\`\`\`

**Output:**
- ⚠️ Missing TypeScript type annotations for parameters \`a\` and \`b\`.
- ⚠️ Return type not declared — inferred as \`any\`.
- ✅ Logic is correct for numeric addition.
- 💡 Consider renaming to \`sum\` for clarity.

### Example 2

**Input:**
\`\`\`python
def fetch_user(id):
    user = db.query(f"SELECT * FROM users WHERE id={id}")
    return user
\`\`\`

**Output:**
- 🚨 SQL injection vulnerability — use parameterized queries.
- ⚠️ No error handling for failed DB queries.
- ⚠️ \`id\` parameter is untyped.
- 💡 Return a typed dataclass/model instead of raw DB row.`,
    constraintContent: `- Focus only on code quality, security, and maintainability.
- Do not rewrite the full implementation unless asked.
- Always prioritize security findings (🚨) above style suggestions (💡).
- Limit output to the top 5 most important findings.
- Be concise — each finding should be one line.`,
  },

  {
    id: 'api-integration',
    name: 'API Integration',
    icon: '🔌',
    tags: ['api', 'http'],
    trigger: 'api',
    description: 'Fetch data and transform API responses',
    exampleContent: `### Example 1

**Input:**
Fetch all open GitHub issues for repo \`owner/repo\` and return titles + labels.

**Output:**
\`\`\`json
[
  { "title": "Fix login bug", "labels": ["bug", "priority:high"] },
  { "title": "Add dark mode", "labels": ["enhancement"] }
]
\`\`\`

### Example 2

**Input:**
Call the OpenWeather API for city "London" and return a one-line weather summary.

**Output:**
\`London: 🌦 14°C, light rain, wind 12 km/h from SW.\``,
    constraintContent: `- Always handle HTTP errors (4xx, 5xx) gracefully with a descriptive message.
- Never include API keys or secrets in output.
- Transform responses into the simplest structure that satisfies the request.
- Add pagination handling when the API response is paginated.
- Respect rate limits — add delays between batch requests if needed.`,
  },

  {
    id: 'data-analysis',
    name: 'Data Analysis',
    icon: '📊',
    tags: ['data', 'csv'],
    trigger: 'analyze',
    description: 'Process datasets and extract insights',
    exampleContent: `### Example 1

**Input:**
\`\`\`csv
date,sales,region
2024-01-01,1200,North
2024-01-02,980,South
2024-01-03,1450,North
\`\`\`

**Output:**
- Total sales: **3,630**
- Top region: **North** (2,650 — 73%)
- Best day: **2024-01-03** (1,450)
- Average daily sales: **1,210**

### Example 2

**Input:**
A list of user session durations in seconds: [120, 45, 300, 90, 600, 30]

**Output:**
- Mean: **197.5 s**
- Median: **105 s**
- P95: **570 s**
- Outlier detected: **600 s** (>2σ above mean)`,
    constraintContent: `- Always summarize with both totals and percentages where relevant.
- Flag statistical outliers explicitly.
- Round numeric output to 2 decimal places unless dealing with integers.
- Do not fabricate or interpolate missing data — note gaps instead.
- Present results in a markdown table when there are more than 3 metrics.`,
  },

  {
    id: 'content-creation',
    name: 'Content Creation',
    icon: '✍️',
    tags: ['writing', 'docs'],
    trigger: 'write',
    description: 'Generate documentation and written content',
    exampleContent: `### Example 1

**Input:**
Write a README introduction for a CLI tool called "snapdiff" that compares JSON snapshots.

**Output:**
# snapdiff

> Compare JSON snapshots with clarity.

\`snapdiff\` is a lightweight CLI tool that diffs two JSON files and highlights structural and value changes in a human-readable format. Ideal for debugging API response changes and tracking configuration drift.

### Example 2

**Input:**
Write a one-paragraph description for a VS Code extension that highlights TODO comments.

**Output:**
**TODO Highlighter** scans your workspace for \`TODO\`, \`FIXME\`, \`HACK\`, and \`NOTE\` comments and surfaces them with color-coded highlights and a dedicated sidebar panel. Never lose track of unfinished work again — every outstanding task is visible at a glance.`,
    constraintContent: `- Match the tone to the target audience (developer docs = precise; marketing copy = engaging).
- Avoid filler phrases like "In today's fast-paced world…".
- Keep sentences under 25 words where possible.
- Use active voice.
- Never fabricate features or capabilities that weren't described in the input.`,
  },

  {
    id: 'workflow',
    name: 'Workflow Automation',
    icon: '⚙️',
    tags: ['automation', 'pipeline'],
    trigger: 'automate',
    description: 'Orchestrate multi-step tasks',
    exampleContent: `### Example 1

**Input:**
Automate: fetch latest GitHub releases for 3 repos, compare version numbers, and post a Slack message if any are outdated.

**Output:**
1. Fetch releases from GitHub API for each repo (parallel).
2. Compare each version against the stored baseline in \`versions.json\`.
3. Collect repos where \`latest != baseline\`.
4. If any outdated, POST to Slack webhook with formatted list.
5. Update \`versions.json\` with new baselines.

### Example 2

**Input:**
On every PR merge to main: run tests, build Docker image, push to registry, deploy to staging.

**Output:**
\`\`\`yaml
steps:
  - run: npm test
  - run: docker build -t app:\${{ github.sha }} .
  - run: docker push registry/app:\${{ github.sha }}
  - run: kubectl set image deployment/app app=registry/app:\${{ github.sha }}
\`\`\``,
    constraintContent: `- Break workflows into discrete, named steps.
- Each step must have a single responsibility.
- Always include error handling between steps.
- Make workflows idempotent where possible.
- Log the start and completion of each step.`,
  },

  {
    id: 'blank',
    name: 'Blank',
    icon: '📝',
    tags: [],
    trigger: '',
    description: 'Start from scratch',
    exampleContent: '',
    constraintContent: '',
  },
];
