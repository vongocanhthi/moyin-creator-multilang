# Contributing Guide

Thank you for your interest in **Moyin Creator**. Contributions of all kinds are welcome.

## Development setup

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (or pnpm >= 8)
- **Git**

### Quick start

```bash
git clone https://github.com/vongocanhthi/moyin-creator-multilang.git
cd moyin-creator-multilang

npm install

npm run dev
```

### Project layout

```
moyin-creator-multilang/
├── electron/          # Electron main process + preload
├── src/
│   ├── components/    # React UI
│   ├── stores/        # Zustand state
│   ├── lib/           # Utilities and business logic
│   ├── packages/      # Internal packages (@opencut/ai-core)
│   └── types/         # TypeScript types
├── build/             # Build assets (icons, etc.)
└── scripts/           # Tooling scripts
```

### Build

```bash
npm run build

npx electron-vite build
```

## Contribution workflow

1. **Fork** this repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a **Pull Request**

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` refactor
- `style:` formatting (no logic change)
- `perf:` performance
- `test:` tests
- `chore:` build or tooling

### Code style

- TypeScript strict mode
- Functional React components and hooks
- Tailwind CSS for styling
- Prefer English for comments and public APIs

## Contributor license (CLA)

By opening a Pull Request, you agree that:

1. You own or have the right to submit the code you contribute
2. You allow maintainers to include your contribution under AGPL-3.0 and, where applicable, under the commercial license
3. Your contribution will be released under AGPL-3.0

This helps maintainers sustain the dual-license model.

## Feedback

- **Bugs:** [GitHub Issues](https://github.com/vongocanhthi/moyin-creator-multilang/issues)
- **Feature ideas:** [GitHub Issues](https://github.com/vongocanhthi/moyin-creator-multilang/issues)
- **Discussion:** [GitHub Discussions](https://github.com/vongocanhthi/moyin-creator-multilang/discussions)

## Code of conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).
