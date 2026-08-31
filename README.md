# 💎 Delulu

**Delulu** is a modern, high-performance AI Skill Studio and IDE designed for authoring, evaluating, benchmarking, and distributing skills across AI agents (Claude Code, Cursor, Google Gemini, Ollama, and Open WebUI).

---

## ✨ Features

- **VS Code Familiarity**: Authentic editor layout, file explorer, activity bar, and status bar.
- **Visual & Code Dual Editing**:
  - **Visual Form Editor**: No-code card-based authoring for quick creation and non-developers.
  - **Zero-CDN Monaco Editor**: Full syntax highlighting, offline worker bundle, and YAML frontmatter support.
  - **Interactive Markmap Mindmaps**: Instant visualization of skill structure and instruction graphs.
- **Multi-Agent Symlink Central**: Store skill packages centrally in `~/.delulu/skills` and auto-symlink across agents (`~/.claude/skills`, `.cursor/skills`, `~/.gemini/skills`).
- **Evals & Playground Studio**: Run real-time evals and benchmark output accuracy against local Ollama or cloud LLMs.
- **Hybrid Architecture**: Runs seamlessly as a desktop app (Electron) or standalone remote web IDE (Browser / Docker / Node.js).

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Development

```bash
# Install dependencies
npm install

# Start Vite dev server (Web Mode)
npm run dev:vite

# Or start full Electron desktop app
npm run dev
```

### Production Build & Remote Web Hosting

```bash
# Build for production
npm run build:vite

# Run standalone web server on port 5174
npm run serve

# Or run with Docker
docker build -t delulu-ide .
docker run -p 5174:5174 delulu-ide
```

---

## 📄 License
MIT
