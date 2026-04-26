# Purabo App Factory ⚒️

**Purabo** is a high-performance, professional-grade binary compiler that transforms web experiences into standalone, native desktop applications. Built with a "Stealth UI" aesthetic, it bridges the gap between the web and the OS with unprecedented elegance.

![License](https://img.shields.io/badge/license-MIT-violet)
![Rust](https://img.shields.io/badge/built%20with-Rust-orange)
![Tauri](https://img.shields.io/badge/powered%20by-Tauri%202-blue)

## 💡 Why Purabo? (USPs)

In a world of bloated browsers and distracting tabs, Purabo offers a focused, native alternative.

- **🚀 Tab Liberation:** Stop losing your most important tools in a sea of 50+ browser tabs. Turn them into separate, alt-tabbable native processes.
- **🎨 Chameleon UI:** Purabo isn't just a wrapper. It uses heuristic brand-analysis to dynamically theme its own interface and the resulting apps to match the target's identity.
- **⚡ Zero-Config Native Engine:** No need to manage complex build toolchains. Purabo's internal "System Doctor" audits and heals your environment with one click, then uses a high-performance adapter-based engine to compile binaries locally.
- **🛡️ Privacy & Performance:** Unlike third-party cloud wrappers, all compilation happens on **your machine**. Resulting apps are lightweight, fast, and completely under your control.
- **🧪 Advanced Injection:** Automatically strip web clutter (Minimalist Mode) and force professional-grade Dark Themes into any site during the forge process.
- **⌨️ Native Bridge:** Every Purabo app includes a built-in command palette (`Cmd+K`) for system-level actions, making web apps feel truly native.

## ✨ Core Experience

- **Universal Resolver:** Intelligent URL ingestion with heuristic asset extraction.
- **Background Engine:** Minimize the forge and continue your workflow while the binary compiles.
- **Surgical Cleanup:** A full uninstaller that cleans up binaries, icons, and system menu entries.
- **Recipe Store:** A curated gallery of optimized templates for world-class tools.

## 🏗️ Technical Architecture

Purabo is engineered for longevity and community extensibility:

- **Adapter Mindset:** Decoupled `ForgeEngine` and `SystemIntegration` traits allow for seamless engine swaps or new OS support.
- **Industrial Observability:** Full telemetry using the `tracing` framework for granular execution tracking.
- **Manifest Persistence:** Standalone apps are tracked via JSON manifests, ensuring total system transparency.

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

## 🛠️ Roadmap & Contribution
Purabo is currently optimized for **Linux**, with robust adapters for **macOS** and **Windows** in active development. We welcome contributions to finalize these platform bridges! See [CONTRIBUTING.md](./CONTRIBUTING.md).

---
Built with ❤️ for the Developer Community.
