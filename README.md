# Purabo App Factory ⚒️

**Purabo** is a professional-grade binary compiler that transforms web experiences into standalone desktop applications. Engineered for performance and minimalist aesthetics, it provides a tactile "App Factory" experience for modern developers.

![License](https://img.shields.io/badge/license-MIT-violet)
![Rust](https://img.shields.io/badge/built%20with-Rust-orange)
![Tauri](https://img.shields.io/badge/powered%20by-Tauri%202-blue)

## ✨ Core Features

- **Universal Resolver:** Intelligent URL ingestion with heuristic asset extraction and brand-color identification.
- **Chameleon UI:** Dynamic interface theming that adapts to the application being processed.
- **Async Engine:** Non-blocking compilation pipeline with background status monitoring.
- **Diagnostics:** Automated dependency auditing and one-click environment provisioning.
- **Clean Uninstallation:** Surgical cleanup of binaries, assets, and OS-level registrations.

## 🏗️ Technical Architecture

Purabo is built with a decoupled, adapter-based backend designed for extensibility:

- **Build Pipeline (`ForgeEngine`):** Abstracted compilation logic, currently utilizing highly optimized webview wrapping.
- **System Bridge (`SystemIntegration`):** Platform-agnostic registration for Linux, macOS, and Windows.
- **Industrial Observability:** Structured telemetry using the `tracing` framework for granular execution tracking.
- **Persistence:** Local manifest-based tracking ensuring total system transparency and data integrity.

## 🚀 Getting Started

### Prerequisites
- **Rust** (Stable)
- **Node.js / pnpm**
- **Linux:** Environment-specific libraries are managed automatically via the internal Diagnostic tool.

### Installation
```bash
git clone https://github.com/Bobeta/purabo.git
cd purabo
pnpm install
```

### Development
```bash
pnpm tauri dev
```

## 🛠️ Contribution
Contributions are welcome, particularly for macOS and Windows system integration modules. See [CONTRIBUTING.md](./CONTRIBUTING.md) for architectural guidelines.

---
Built for the open-source community.
