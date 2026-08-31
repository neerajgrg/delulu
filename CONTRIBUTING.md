# Contributing to Delulu AI Skill Studio

Thank you for your interest in contributing to **Delulu**! We welcome contributions from developers of all backgrounds.

---

## 📜 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Conventions](#commit-conventions)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by the [Delulu Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

### 2. Fork & Clone
```bash
git clone https://github.com/<your-username>/delulu.git
cd delulu
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
# Web Mode (Fast HMR)
npm run dev:vite

# Electron Desktop Mode
npm run dev
```

---

## 🔍 Pull Request Process

1. **Create a branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**:
   - Write clean, type-safe TypeScript code.
   - Maintain UI consistency with Tailwind CSS and the dark/light design system.
   - Verify zero compiler errors:
     ```bash
     npm run typecheck
     npm run build:vite
     ```

3. **Commit your changes**:
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add new token analyzer widget`
   - `fix: resolve race condition in tab opening`
   - `docs: update quick start instructions`
   - `refactor: simplify title bar navigation`

4. **Submit a Pull Request**:
   - Open a PR against the `main` branch.
   - Describe what the PR accomplishes and reference any linked issues.

---

## 📐 Coding Standards

- **TypeScript First**: Strict typing enabled. Avoid using `any` unless absolutely necessary for third-party library bridges.
- **Component Design**: Functional components with hooks. Keep components modular and single-responsibility.
- **Styling**: Tailwind CSS utility classes using project theme tokens (`bg-base`, `bg-surface`, `text-ink`, `border-line`).
- **State Management**: Zustand store (`src/store/useStore.ts`) using immutable state updates.

---

## 💬 Community & Questions

Have questions or ideas? Feel free to open an Issue or Discussion on GitHub!
