# ✦ Delulu AI Skill Studio & IDE

<div align="center">

<img src="https://raw.githubusercontent.com/neerajgrg/delulu/main/public/delulu-logo.svg" alt="Delulu Logo" width="96" height="96" onerror="this.style.display='none'" />

**The Universal Open-Source IDE & Benchmark Studio for AI Agent Skills**

[![Docs](https://img.shields.io/badge/Docs-GitHub_Pages-6366f1?style=flat-square&logo=githubpages&logoColor=white)](https://neerajgrg.github.io/delulu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Agent Standards](https://img.shields.io/badge/Agents-Claude%20%7C%20Gemini%20%7C%20Cursor%20%7C%20Ollama-7c3aed?style=flat-square)](https://github.com/neerajgrg/delulu)

[📚 Documentation Site](https://neerajgrg.github.io/delulu/) • [Features](#-key-features) • [Quick Start](#-quick-start) • [Universal Skill Standard](#-universal-skill-standard) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 Overview

**Delulu** is a purpose-built IDE designed specifically for authoring, evaluating, debugging, and distributing reusable skill packages (`.skill.md`) across multiple AI agent runtimes — including **Anthropic Claude Code**, **Cursor AI Agent**, **Google Gemini / Antigravity**, **Local Ollama / Llama**, and **MCP (Model Context Protocol)** servers.

It bridges the gap between raw prompt engineering and structured software development by treating AI skills as first-class codebase citizens with linting, quality scoring, real-time token budgeting, interactive mindmaps, and evals test runners.

---

## ✨ Key Features

### 🎛️ 1. Native IDE Experience with Top-Level Menubar
- Authentic traditional layout with **File**, **Edit**, **View**, **Skill**, **Window**, and **Help** menus.
- Keyboard accelerator shortcuts (`⌘N`, `⌘O`, `⌘S`, `⌘W`, `⌘Z`, `⌘F`, `⌘K`, `⌘B`, `⌘J`, `⌘,`).
- Clean VS Code-style global search and command palette (`⌘K` / `⌘P`).
- Status bar with active workspace, encoding, skill count, and active agent session indicators.

### 📝 2. Multi-Mode Authoring Studio
- **Visual Form Editor**: No-code form interface for rapid skill definition, few-shot examples, parameter tuning, and negative guardrails.
- **Monaco Code Editor**: Zero-CDN offline Monaco code editor with custom dark/light themes, YAML frontmatter syntax highlighting, and live Markdown preview.
- **Interactive Mindmap (AST)**: Instant hierarchical mindmaps powered by D3 and Markmap to visualize skill instruction flow and parameter graphs.
- **1-Step Quick Creation**: Streamlined template picker with instant AI auto-fill generation.

### ⚡ 3. Real-Time Token Counting & Context Budgeting
- Live BPE token estimation across all editor fields, YAML frontmatter, and code blocks.
- Context window consumption indicators (`% of 128k context budget`).
- Estimated cost per 1k invocations to prevent prompt bloat.

### 🧪 4. Evals & Benchmarking Studio
- Interactive Playground runner to test skills against local Ollama sessions (`gemma3`, `llama3`, `mistral`) or cloud LLMs (`claude-3-5-sonnet`, `gemini-2.0-flash`).
- Live execution output with provider status badges, pass/fail grading, and execution logs.
- Bottom Console with **Skill REPL**, **Problems & Linting**, and **System Diagnostics**.

### 🔗 5. Multi-Agent Symlink Central & Vault
- Store your master skills in `~/.delulu/skills/` and symlink them across local agent installations (`~/.claude/skills`, `.cursor/skills`, `~/.gemini/skills`).
- Automatically detects installed AI CLI sessions and environment API keys.

### 🌐 6. Hybrid Desktop & Remote Web Deployment
- Run natively on macOS, Linux, or Windows via **Electron**.
- Run anywhere in a browser via the standalone Node.js server (`server.js`) or production **Docker** container.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/neerajgrg/delulu.git
cd delulu

# Install dependencies
npm install
```

### 2. Run in Development Mode

```bash
# Run Web IDE (Fast Vite Dev Server)
npm run dev:vite

# Or Run Desktop App (Electron + Vite)
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## 🐳 Docker & Remote Hosting

Delulu can be self-hosted on remote servers or local containers with zero external dependencies:

```bash
# Build Docker image
docker build -t delulu-ide .

# Run container on port 5174
docker run -d -p 5174:5174 --name delulu delulu-ide
```

Or run via the standalone Node.js server:

```bash
npm run build:vite
npm run serve
```

---

## 📄 Universal Skill Standard (`.skill.md`)

Delulu standardizes agent skills into clean, human-readable Markdown files with YAML frontmatter:

```markdown
---
name: code-review
description: "Inspect code for quality, potential bugs, edge cases, and style improvements."
trigger: "review"
tags: [code, review, quality]
model: claude-3-5-sonnet-20241022
temperature: 0.7
max_tokens: 2048
---

# Code Review

## Description
Comprehensive code quality and security inspection agent skill.

## Examples

### Example 1
**Input:**
```typescript
function add(a, b) { return a + b; }
```

**Output:**
- ⚠️ Missing TypeScript type annotations for parameters `a` and `b`.
- ⚠️ Return type not declared — inferred as `any`.
- ✅ Logic is correct for numeric addition.

## Constraints
- Always provide actionable code diffs.
- Never output raw API keys or credentials.
```

---

## 🏗️ Architecture

```
delulu/
├── electron/                 # Electron main & preload IPC processes
│   ├── main.ts
│   └── preload.ts
├── src/
│   ├── components/
│   │   ├── editor/           # Monaco, Markdown Preview, Markmap, Visual Editor
│   │   ├── layout/           # TitleBar, AppMenuBar, ActivityBar, SidePanel, StatusBar, BottomConsole
│   │   ├── panels/           # SkillsExplorer, InspectorPanel
│   │   ├── shared/           # Icons, DeluluLogo, QualityStars, Modals
│   │   └── views/            # WelcomeView, EditorView, SkillBuilder, GalleryView, EvalsView, SettingsView
│   ├── lib/                  # Token counting, Markdown parsing, Quality scoring, Linting, Mock API
│   ├── store/                # Zustand global state (useStore.ts)
│   ├── types/                # TypeScript definitions (delulu.d.ts)
│   ├── App.tsx               # Root component & keyboard shortcuts
│   └── main.tsx              # React DOM entrypoint
├── Dockerfile                # Production multi-stage Docker build
├── server.js                 # Standalone static web server
└── vite.config.ts            # Vite bundler & Monaco worker configuration
```

---

## 🧪 Testing & Verification

```bash
# Run TypeScript Typecheck
npm run typecheck

# Run Production Vite Build
npm run build:vite

# Full Electron Production Build
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [**Contributing Guide**](CONTRIBUTING.md) and [**Code of Conduct**](CODE_OF_CONDUCT.md) before opening pull requests.

```bash
# 1. Fork the repo and create your branch
git checkout -b feat/my-new-feature

# 2. Make changes and verify types
npm run typecheck

# 3. Commit and push
git commit -m "feat: add support for custom agent runtimes"
git push origin feat/my-new-feature
```

---

## 🛡️ Security

For reporting security vulnerabilities, please refer to our [Security Policy](SECURITY.md).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
