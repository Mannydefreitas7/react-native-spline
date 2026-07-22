# Contributing to react-native-spline

Thank you for your interest in contributing! This document outlines the process and guidelines for contributing.

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/emmanuel-defreitas/react-native-spline.git
   cd react-native-spline
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Build the project:

   ```bash
   bun run build
   ```

4. Run tests:

   ```bash
   bun run test
   ```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation. All commits must follow this format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                                      | Version Bump |
| ---------- | ------------------------------------------------ | ------------ |
| `feat`     | A new feature                                    | Minor        |
| `fix`      | A bug fix                                        | Patch        |
| `perf`     | Performance improvements                         | Patch        |
| `refactor` | Code refactoring without feature/fix             | Patch        |
| `docs`     | Documentation changes                            | None\*       |
| `style`    | Code style changes (formatting, semicolons, etc) | None         |
| `test`     | Adding or updating tests                         | None         |
| `build`    | Build system or dependency changes               | None         |
| `ci`       | CI/CD configuration changes                      | None         |
| `chore`    | Other maintenance tasks                          | None         |
| `revert`   | Revert a previous commit                         | Varies       |

\* `docs(README)` will trigger a patch release.

### Breaking Changes

To indicate a breaking change, add `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```bash
# Using ! notation
feat!: remove deprecated API

# Using footer
feat: change API response format

BREAKING CHANGE: The response now returns an array instead of an object.
```

Breaking changes will trigger a **major** version bump.

### Examples

```bash
# Feature (minor release: 1.0.0 → 1.1.0)
feat: add gyroscope support for 3D interactions

# Bug fix (patch release: 1.1.0 → 1.1.1)
fix: resolve crash on Android when loading large assets

# Performance improvement (patch release)
perf: optimize splinecode parsing

# Documentation (no release)
docs: update installation instructions

# Breaking change (major release: 1.1.1 → 2.0.0)
feat!: require Expo SDK 55 or higher

# With scope
feat(ios): add haptic feedback support
fix(android): correct touch coordinates
```

## Pull Request Process

1. **Create a feature branch** from `main` or `master`:

   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes** and commit using conventional commits.

3. **Run checks locally** before pushing:

   ```bash
   bun run lint
   bun run test
   bun run build
   ```

4. **Push your branch** and create a pull request.

5. **CI checks** will run automatically:
   - Linting (Biome)
   - Tests (Jest)
   - Build verification
   - Commit message validation

6. Once approved and merged, **semantic-release** will automatically:
   - Determine the next version based on commits
   - Update `package.json` version
   - Generate/update `CHANGELOG.md`
   - Create a GitHub release
   - Publish to npm

## Code Style

This project uses [Biome](https://biomejs.dev/) exclusively for linting, formatting, and import organization. There is no ESLint or Prettier configuration.

### Available Commands

```bash
# Check everything (lint + typecheck)
bun run check

# Lint only (check for issues)
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format code
bun run format

# Type check only
bun run typecheck
```

### Editor Setup

This project includes Zed editor settings in `.zed/settings.json` that configure:

- Biome as the primary language server for TypeScript/JavaScript/JSON
- Format on save with Biome
- Automatic import organization
- Auto-fix linting issues on save

If you use a different editor, configure it to use Biome for formatting and linting. The `biome.jsonc` configuration file at the project root contains all the rules.

### VS Code Setup

If you use VS Code, install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) and add to your workspace settings:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.biome": "explicit"
  }
}
```

## Questions?

If you have questions, feel free to open an issue or start a discussion.
