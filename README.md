# Zensloom

Free, open-source, Windows-only screen recorder with real-time webcam background removal. Forked from [Cap](https://github.com/CapSoftware/Cap).

<!-- TODO: Add screenshot -->
![Zensloom Screenshot](docs/screenshot-placeholder.png)

## Features

- **Screen recording** — full screen, window, or region capture
- **Webcam overlay with background removal** — blur, replace, custom image, or full removal powered by ONNX Runtime
- **Built-in video editor** — trim, add backgrounds, zoom effects, annotations, and export
- **Local transcription** — AI-powered captions via OpenAI Whisper (bring your own API key)
- **Local-only & private** — no cloud, no accounts, no telemetry. Your recordings stay on your machine.
- **Multiple export formats** — MP4, GIF, WebM

## Installation

Download the latest installer from [GitHub Releases](https://github.com/ZensbotLLC/Zensloom/releases).

## Build from Source

### Prerequisites

- [Rust](https://rustup.rs/) (1.88 or newer, edition 2024)
- [Node.js](https://nodejs.org/) 20 or newer
- [pnpm](https://pnpm.io/) 10.5+
- Visual Studio 2022 with C++ Desktop Development workload
- [CMake](https://cmake.org/) (for native dependencies)

### Steps

```bash
# Clone the repository
git clone https://github.com/ZensbotLLC/Zensloom.git
cd Zensloom

# Install JS dependencies
pnpm install

# Fetch Rust dependencies
cargo fetch

# Run in development mode (hot reload, opens app window)
pnpm tauri dev

# Build a release MSI installer
pnpm tauri build
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm tauri dev` | Development mode with hot reload |
| `pnpm test` | Run all TypeScript/JavaScript tests |
| `cargo nextest run` | Run all Rust tests |
| `pnpm exec biome check .` | Lint and format check |
| `cargo clippy -- -D warnings` | Rust linting |
| `pnpm typecheck` | TypeScript type checking |

## Documentation

All project documentation lives in the [`docs/`](docs/) folder:

- [Product Requirements (PRD)](docs/01-PRD.md)
- [Tech Stack](docs/02-Tech-Stack.md)
- [User Flow](docs/03-User-Flow.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [Roadmap](docs/ROADMAP.md)

## License

This project is licensed under the [AGPLv3](LICENSE), forked from Cap (also AGPLv3).

- Camera crate code (`cap-camera*`) is MIT-licensed per the upstream project.
- Third-party dependencies retain their original licenses.
