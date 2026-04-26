# Purabo: Detailed Design & Technical Specification

## Core Vision
**Purabo** transforms the complex process of "packaging web apps" into a tactile, elegant experience. It prioritizes:
- **Minimalism:** No terminal, no config files, no clutter.
- **Native Power:** Standalone binaries, real system icons, OS-level shortcuts.
- **Branding:** Dynamic UI that adapts to the app being forged.

## Technical Architecture

### 1. Build Engine (Adapter Pattern)
Abstracted via the `ForgeEngine` trait to support multiple backends.
- **Current implementation:** `PakeEngine` (utilizes Tw93/Pake-CLI via sidecar or npx).
- **Future implementation:** `NativeEngine` (Direct Rust/Wry compilation).

### 2. Platform Integration (Adapter Pattern)
Agnostic system registration via `SystemIntegration` trait.
- **Linux:** Generates `.desktop` files in `~/.local/share/applications/`.
- **macOS:** Symlinks `.app` bundles into `~/Applications`.
- **Windows:** Generates `.lnk` shortcuts via PowerShell in Start Menu.

### 3. File System Schema
- **Binaries:** `~/.local/share/purabo/apps/*.AppImage`
- **Icons:** `~/.local/share/purabo/apps/*.png`
- **Manifests:** `~/.local/share/purabo/apps/*.json`

## Domain Logic

### Asset Resolution Engine
Automated harvesting of website metadata using standard heuristic parsers.
- **Icon Extraction:** Intelligent asset detection.
- **Color Extraction:** Dominant brand color identification for Chameleon UI.

### System Doctor
Continuous monitoring of build dependencies:
- Checks for: `rustc`, `cargo`, `gcc`, `pnpm`, `webkit2gtk`.
- Offers one-click "Heal" via `pkexec` for Linux.

## Release Strategy
- **Open Source:** MIT License.
- **CI/CD:** Automated cross-platform builds via GitHub Actions.
- **Future:** Community-driven Recipe Store.
