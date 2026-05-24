# Contributing to Zensloom

Thank you for your interest in contributing to Zensloom! This document covers the development setup, coding standards, and contribution process.

## Development Setup

### Prerequisites

- [Rust](https://rustup.rs/) 1.88+ (edition 2024)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10.5+
- Visual Studio 2022 with C++ Desktop Development workload
- [CMake](https://cmake.org/)
- [cargo-nextest](https://nexte.st/) (recommended for running Rust tests)

### Getting Started

```bash
git clone https://github.com/ZensbotLLC/Zensloom.git
cd Zensloom
pnpm install
cargo fetch
pnpm tauri dev
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `pnpm tauri dev` | Run in development mode |
| `pnpm test` | Run JS/TS tests (Vitest) |
| `cargo nextest run` | Run Rust tests |
| `cargo nextest run -p zensloom-segment` | Run a single crate's tests |
| `pnpm exec biome check .` | Lint + format check |
| `pnpm exec biome check --write .` | Auto-fix lint/format |
| `cargo clippy -- -D warnings` | Rust linting |
| `cargo fmt` | Format Rust code |
| `pnpm typecheck` | TypeScript type check |

## Code Style

For full details, see `CLAUDE.md` in the project root.

### TypeScript / SolidJS

- Strict mode enabled. No `any` types.
- No default exports except SolidJS route components.
- Component files: PascalCase (`RecordButton.tsx`).
- Hook/util files: camelCase (`useRecording.ts`).
- Stores in `apps/desktop/src/stores/<feature>.ts`.

### Rust

- Edition 2024. `#![forbid(unsafe_code)]` by default on every crate.
- Error handling: `thiserror` for libraries, `anyhow` for application code. Never `unwrap()` in production.
- Logging: `tracing` crate. No `println!` outside tests.
- Async runtime: `tokio` only.

### Formatting and Linting

Run before every commit:

```bash
pnpm exec biome check . && pnpm typecheck && cargo clippy -- -D warnings && cargo nextest run
```

## Pull Request Process

### Branch Naming

- `feature/<short-name>` for new features
- `fix/<short-name>` for bug fixes
- `chore/<short-name>` for maintenance
- `docs/<short-name>` for documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add webcam blur mode selector
fix: resolve crash on region capture resize
refactor: extract encoder selection to separate module
docs: update architecture diagram for BG removal pipeline
test: add integration tests for ONNX model loading
```

The body should explain *why*, not *what*.

### PR Guidelines

- Target less than 400 lines changed. Split larger work into multiple PRs.
- Reference the relevant PRD/User Flow section in the description.
- Include a test plan.
- All CI checks must pass before merge.
- Never force-push to `main`.

## Testing

### What to Test

- Business logic and data transforms
- Edge cases and error paths
- Integration between crates

### What NOT to Test

- Trivial getters
- Framework code
- Third-party libraries

### Mocking

- Mock FFmpeg and external APIs in tests
- Never call real OpenAI in CI

## Reporting Issues

Please open an issue before starting work on a PR. Include:

- Clear description of the bug or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- System information (Windows version, GPU if relevant)

## License

By contributing, you agree that your contributions will be licensed under the AGPLv3.
