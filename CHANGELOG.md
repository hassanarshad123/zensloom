# Changelog

All notable changes to Zensloom are documented in this file.

## [0.6.0-alpha-transcripts] - 2026-05-24

### Added
- DPAPI-backed secrets storage for API keys (Windows Credential Manager)
- OpenAI Whisper transcription integration (BYOK)
- Captions editor with word-level highlighting
- Transcription settings page with vocabulary/spelling hints

### Security
- API keys never stored in plaintext; always encrypted via Windows DPAPI

## [0.5.0-alpha-annotations] - 2026-05-20

### Added
- Annotation types in the editor: arrows, rectangles, circles, text, freehand
- Annotation color picker and stroke width controls
- Undo/redo support for annotations

## [0.4.0-alpha-editor] - 2026-05-16

### Added
- Editor window verified and functional
- Timeline with trim, split, and segment management
- Export pipeline (MP4, GIF, WebM) with FFmpeg sidecar
- Background effects in editor (blur, color, image)

## [0.3.0-alpha-bgremoval] - 2026-05-12

### Added
- Background removal modes: none, blur, color, image, remove
- ONNX Runtime integration with MediaPipe Selfie Segmentation model
- Lite mode for lower-end hardware (reduced resolution segmentation)
- Real-time webcam preview with applied BG mode

## [0.2.0-alpha-recording] - 2026-05-08

### Added
- Recording pipeline verified end-to-end
- Screen capture (full screen, window, region) via `windows-capture` crate
- Webcam capture via `cap-camera` crate
- Audio capture (system + microphone)
- HUD overlay with timer and stop button
- Library view with recording thumbnails

## [0.1.0-foundation] - 2026-05-04

### Added
- Initial fork from [Cap](https://github.com/CapSoftware/Cap)
- Stripped all cloud code, authentication, and telemetry
- Renamed crates to `zensloom-*` namespace
- Established local-only architecture
- Tauri 2 desktop shell with SolidJS frontend
- Project documentation (PRD, Tech Stack, User Flow, Architecture, Design System)
