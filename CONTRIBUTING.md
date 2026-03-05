# 🤝 Contributing to SplitX

First off, **thank you** for considering contributing to SplitX! Every contribution helps make expense splitting better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🙋 How Can I Contribute?

### 🐛 Report Bugs
- Use the [Bug Report template](https://github.com/strivedi4u/splitx/issues/new?template=bug_report.md)
- Include steps to reproduce, expected vs actual behavior, and screenshots

### ✨ Suggest Features
- Use the [Feature Request template](https://github.com/strivedi4u/splitx/issues/new?template=feature_request.md)
- Explain the motivation and proposed solution

### 💻 Submit Code
- Look for issues tagged [`good first issue`](https://github.com/strivedi4u/splitx/labels/good%20first%20issue) or [`help wanted`](https://github.com/strivedi4u/splitx/labels/help%20wanted)
- Fork, implement, and submit a PR!

### 📝 Improve Documentation
- Fix typos, add examples, improve explanations
- Documentation changes don't need an issue — just submit a PR

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+
- **npm** or **bun**
- **Git**

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/splitx.git
cd splitx

# 2. Start the backend
cd backend
cp .env.example .env     # Set JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# 3. Start the frontend (new terminal)
cd ..
cp .env.example .env.local
npm install
npm run dev               # http://localhost:8080
```

## 📁 Project Structure

```
splitX/
├── src/                  # Frontend (React + TypeScript)
│   ├── components/       # UI components
│   ├── context/          # State management (Auth, App, Notification)
│   ├── lib/              # API client, utilities
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Route pages
│   └── types/            # TypeScript interfaces
├── backend/              # Backend (Node.js + Express)
│   ├── src/controllers/  # Business logic
│   ├── src/models/       # Data models
│   ├── src/routes/       # API routes
│   └── src/config/       # Configuration
└── android/              # Capacitor Android project
```

## 📏 Coding Guidelines

### Frontend (TypeScript/React)
- Use **functional components** with hooks
- Use **TypeScript** — no `any` unless unavoidable
- Use **Tailwind CSS** for styling (no inline styles or CSS modules)
- Follow existing component patterns for consistency
- Use `apiFetch()` from `lib/api.ts` for API calls

### Backend (JavaScript/Express)
- Use **async/await** for asynchronous code
- Validate inputs in controllers
- Use the `db.js` helpers for data access
- Add appropriate error messages in responses

### General
- Keep functions small and focused
- Write self-documenting code with clear variable/function names
- Remove console.log statements before submitting
- Test your changes locally before submitting

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactor (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, CI, deps, tooling |

### Examples
```
feat(expense): add percentage split mode
fix(auth): handle expired JWT token gracefully
docs(readme): update API reference section
chore(deps): update React to 18.3
```

## 🔀 Pull Request Process

1. **Create an issue first** (unless it's a tiny fix)
2. **Fork** the repository
3. **Create a branch** from `master`: `git checkout -b feat/my-feature`
4. **Make your changes** following the guidelines above
5. **Test locally** — ensure build passes: `npm run build`
6. **Commit** using conventional commit format
7. **Push** and open a PR against `master`
8. **Fill out** the PR template completely
9. **Wait for review** — maintainers will review within a few days

### PR Requirements
- ✅ Passes CI checks (lint + build)
- ✅ No merge conflicts
- ✅ Follows coding guidelines
- ✅ PR template completed
- ✅ Linked to an issue (if applicable)

---

## ❓ Questions?

Feel free to [open a discussion](https://github.com/strivedi4u/splitx/discussions) or reach out to [@strivedi4u](https://github.com/strivedi4u).

**Thank you for making SplitX better! 🎉**
