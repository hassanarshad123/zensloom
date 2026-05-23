# CLAUDE.md

> This file is read by Claude Code on every session. Keep it under 500 lines.
> Update it when conventions change. Treat violations as bugs.

---

## Project: Zensloom

**Zensloom is a free, open-source, Windows-only screen recorder forked from [Cap](https://github.com/CapSoftware/Cap).** It differentiates through real-time webcam background removal (blur, replace, custom) and a playful, polished UX. v1.0 is **local-only** — no cloud, no accounts, no telemetry.

**Read these docs before non-trivial work:**
- `docs/01-PRD.md` — what we're building and why
- `docs/02-Tech-Stack.md` — what tools and why
- `docs/03-User-Flow.md` — every UX flow
- `docs/ARCHITECTURE.md` — where code lives
- `docs/ROADMAP.md` — phased build plan
- `docs/DESIGN-SYSTEM.md` — UI tokens and patterns

If your task touches a feature, find it in PRD + User Flow first. Don't invent.

---

## Hard rules (never violate)

1. **Never commit secrets.** No API keys, no signing keys, no `.env` files. If you find one, refuse to commit and tell the user.
2. **Never add telemetry, analytics, crash reporting, or any code that phones home** in v1.0. Zero exceptions. Privacy is a core promise.
3. **Never use `unsafe` Rust** without explicit user approval and an inline comment explaining why.
4. **Never use `any` in TypeScript.** Use `unknown` and narrow, or define the type.
5. **Never make a network call from the desktop app** to anywhere except: the user's chosen AI provider (api.openai.com / api.anthropic.com) and api.github.com (for manual update checks). No CDNs, no fonts, no analytics, no Sentry, nothing.
6. **Never break the Rust ↔ TS IPC contract** without updating both sides. The `specta`-generated types in `apps/desktop/src/bindings.ts` must stay in sync.
7. **Never store API keys in plaintext.** Always use Windows DPAPI via the secrets module.
8. **Never bundle code under a license incompatible with AGPLv3** without first asking. Check every new dependency's license.
9. **Never auto-update without user consent** in v1.0. Updates are manual ("Check for updates" button only).
10. **Never assume cloud features exist.** v1.0 is local-only. If the user asks for "upload" or "share link" features, confirm they mean v2.0 work.

---

## Tech stack (one-line each)

- **Desktop framework:** Tauri 2 (Rust backend, web frontend, WebView2)
- **Frontend:** SolidJS + TypeScript (strict) + Tailwind CSS
- **State:** SolidJS stores (no Redux, no Zustand)
- **Rust edition:** 2024
- **Database:** SQLite via `sqlx` (compile-time checked queries)
- **Screen capture:** `windows-capture` crate + `windows-rs` direct calls
- **Webcam:** Cap's `cap-camera` crate (MIT-licensed, reused)
- **BG removal:** ONNX Runtime (`ort` crate) with MediaPipe Selfie Segmentation (default) or RVM (HD mode)
- **Video encoding:** FFmpeg sidecar with NVENC/QSV/AMF/libx264 fallback
- **Transcription:** OpenAI Whisper API (user-provided key, BYOK)
- **Settings:** `tauri-plugin-store` (JSON)
- **Secrets:** Windows DPAPI
- **IPC types:** `specta` (Rust → TS type generation)
- **Package manager:** `pnpm` (workspaces) + `cargo` (workspaces)

Full reasoning in `docs/02-Tech-Stack.md`. Don't introduce alternatives without asking.

---

## Project structure

```
zensloom/
├── apps/
│   ├── desktop/                 # Main Tauri app
│   │   ├── src/                 # SolidJS UI
│   │   ├── src-tauri/           # Rust backend
│   │   │   └── src/commands/    # Tauri IPC handlers (one file per feature)
│   │   └── bindings.ts          # AUTO-GENERATED, do not edit by hand
│   └── editor/                  # Editor window (may merge into desktop)
├── crates/
│   ├── zensloom-capture/        # Screen capture
│   ├── zensloom-camera/         # Webcam (uses cap-camera)
│   ├── zensloom-segment/        # Background removal (NEW, our work)
│   ├── zensloom-encode/         # FFmpeg orchestration
│   └── zensloom-types/          # Shared types
├── packages/
│   ├── ui/                      # Shared React/Solid components
│   ├── icons/                   # Lucide + custom
│   └── tsconfig/                # Shared TS config
├── resources/
│   ├── ffmpeg/                  # Bundled FFmpeg binaries (per arch)
│   ├── models/                  # ONNX/TFLite model files (Git LFS)
│   └── backgrounds/             # Default background images
├── docs/                        # ALL project docs live here
└── .github/workflows/           # CI
```

**When adding a new feature:**
- UI components → `apps/desktop/src/components/<feature>/`
- Rust logic → either an existing crate or new crate `crates/zensloom-<feature>/`
- Shared types → `crates/zensloom-types/`
- Tauri command → `apps/desktop/src-tauri/src/commands/<feature>.rs`

**Never:**
- Put business logic in `main.rs`
- Mix UI and logic in one file > 300 lines
- Create a new top-level folder without asking

---

## How to run things

```bash
# Install (run once)
pnpm install
cargo fetch

# Dev (hot reload, opens app window)
pnpm tauri dev

# Run a Rust crate's CLI standalone (great for testing capture/encode)
cargo run -p zensloom-capture --bin test-capture -- --duration 5

# Tests
pnpm test               # all TS/JS tests via Vitest
cargo nextest run       # all Rust tests (preferred over `cargo test`)
cargo nextest run -p zensloom-segment   # one crate

# Lint
pnpm exec biome check .    # lint + format check (Biome, not ESLint)
cargo clippy -- -D warnings

# Format
pnpm exec biome check --write .
cargo fmt

# Type check
pnpm typecheck

# Build release MSI
pnpm tauri build
```

**Before committing, run:** `pnpm exec biome check . && pnpm typecheck && cargo clippy -- -D warnings && cargo nextest run`

---

## Conventions

### TypeScript / SolidJS
- **Strict mode on.** Never disable.
- **No `any`.** Use `unknown` and narrow.
- **No default exports** except for SolidJS route components.
- **Component files:** PascalCase (`RecordButton.tsx`).
- **Hook/util files:** camelCase (`useRecording.ts`).
- **Stores live in** `apps/desktop/src/stores/<feature>.ts`.
- **Tauri commands called via** the generated `bindings.ts`, never `invoke()` directly.

### Rust
- **Edition 2024.** Pin Rust version via `rust-toolchain.toml`.
- **`#![forbid(unsafe_code)]`** at the top of every crate by default. Remove only when justified and approved.
- **Error handling:** `thiserror` for library errors, `anyhow` for application errors. Never `unwrap()` in production paths — use `?` or `expect("reason")` in tests.
- **Logging:** `tracing` crate. Use spans for capture/encode pipelines. Never `println!` outside tests.
- **Module structure:** `mod.rs` is deprecated style; use `feature.rs` + `feature/` folder.
- **Async runtime:** `tokio`. Don't mix with `async-std`.

### Git
- **Branch naming:** `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`, `docs/<short-name>`.
- **Commits:** Conventional Commits. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `style:`. Body explains *why*, not what.
- **PR size:** target <400 lines changed. If bigger, split.
- **Never force-push to `main`.** Force-push on feature branches is fine before review.

### File / naming
- **Snake_case for Rust files** (`screen_capture.rs`).
- **kebab-case for TS/JSX route files** (`new-recording.tsx`).
- **PascalCase for component files** (`RecordButton.tsx`).
- **SCREAMING_SNAKE_CASE for constants.**
- **No abbreviations in names** except: `id`, `db`, `url`, `api`, `fs`, `os`, `vfx`. (`recording` not `rec`, `background` not `bg` in code — UI copy may use `BG`.)

### Tests
- **Unit tests live next to code** (`#[cfg(test)] mod tests` in Rust, `.test.ts` next to `.ts`).
- **Integration tests in `tests/`** at the crate root.
- **What to test:** business logic, data transforms, edge cases, error paths.
- **What NOT to test:** trivial getters, framework code, third-party libraries.
- **Mock FFmpeg and external APIs** in tests. Never call real OpenAI in CI.

---

## Glossary (project-specific terms)

| Term | Meaning |
|------|---------|
| **Recording** | A captured video, stored on disk, listed in the library. |
| **Clip** | A segment of a recording in the editor timeline (not yet a distinct concept; reserve the word). |
| **Source** | What's being captured: full screen, window, region, webcam-only. |
| **BG mode** | The webcam background mode: `none`, `blur`, `color`, `image`, `remove`. Use this exact enum. |
| **HUD** | The small floating widget shown while recording (timer + stop button). |
| **Overlay** | The pre-record control panel (source selector, webcam preview). |
| **Compositor** | The pipeline that merges screen + masked webcam into one frame. |
| **Sidecar** | A bundled binary the app spawns (FFmpeg, mainly). |
| **BYOK** | "Bring Your Own Key" — user provides their own OpenAI/Anthropic key for AI features. |
| **Library** | The user's collection of past recordings (Main App home view). |
| **Lite mode** | Reduced-quality BG removal for low-end hardware. |

When in doubt, use the term from this glossary. Don't invent synonyms.

---

## Hot files (consult these often)

- `apps/desktop/src-tauri/src/commands/mod.rs` — all IPC commands registry
- `apps/desktop/src/bindings.ts` — generated TS types (read-only, regenerate via `cargo run --bin gen-bindings`)
- `crates/zensloom-types/src/lib.rs` — shared types between crates
- `crates/zensloom-capture/src/pipeline.rs` — main capture loop
- `crates/zensloom-segment/src/lib.rs` — BG removal entry point
- `crates/zensloom-encode/src/ffmpeg.rs` — FFmpeg invocation
- `apps/desktop/src/stores/recording.ts` — recording state machine
- `apps/desktop/src/stores/library.ts` — library state
- `docs/DESIGN-SYSTEM.md` — UI tokens, never guess colors/spacing

---

## When you're unsure

**Stop and ask the user.** Specifically:
- Ambiguous requirements → ask
- Choice between two reasonable architectures → ask, explain tradeoffs
- A task that could break a "Hard rule" above → ask
- A new dependency over 100 KB → ask, justify
- A change that touches >5 files in different areas → propose a plan first
- Anything that smells like scope creep → confirm against PRD's "out of scope" list

**Don't:**
- Don't try to build multiple features in one session
- Don't refactor code unrelated to your task
- Don't delete code "to clean up" without checking what uses it
- Don't update dependencies as a side effect of a feature PR
- Don't write a 1000-line file — break it up
- Don't reach for a popular library when the standard library / built-in does it

---

## Definition of done (for any task)

A task is done when:
1. ✅ It implements the requirement (verify against PRD/User Flow)
2. ✅ Tests pass (`pnpm test && cargo nextest run`)
3. ✅ Lints pass (`pnpm exec biome check . && cargo clippy -- -D warnings`)
4. ✅ Types pass (`pnpm typecheck`)
5. ✅ It runs in `pnpm tauri dev` without errors in the console
6. ✅ Manual smoke test of the happy path
7. ✅ No new TODO/FIXME comments without an issue link
8. ✅ Docs updated if behavior or APIs changed (README, ARCHITECTURE, this file)
9. ✅ Commit message follows Conventional Commits
10. ✅ PR description references the relevant PRD/User Flow section

---

## Pasted into every session (your reminder)

- **We are pre-1.0. Quality > speed.**
- **Local-only. Privacy is a promise.**
- **One feature at a time.**
- **When unsure, ask.**
- **Re-read this file when conventions feel fuzzy.**

---

**Last updated:** May 23, 2026. Edit liberally as conventions evolve. Increment a small version comment at the top if you make breaking changes to rules.
