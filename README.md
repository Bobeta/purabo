# Purabo App Factory ⚒️

**Purabo** is a high-performance binary factory that transforms web experiences into standalone, native desktop applications. Engineered for senior developers and minimalist enthusiasts, it provides the OS integration of a Store-app with the extreme efficiency of a system-native binary.

![License](https://img.shields.io/badge/license-MIT-violet)
![Rust](https://img.shields.io/badge/built%20with-Rust-orange)
![Tauri](https://img.shields.io/badge/powered%20by-Tauri%202-blue)

## 💡 Why Purabo? (Unique Selling Points)

Purabo is designed to replace both bloated browser tabs and heavy "Official" Store apps (Electron).

- **🚀 100x Lighter (Electron Killer):** While official store apps (WhatsApp, Discord, Slack) often ship a 100MB+ Chrome instance, Purabo utilizes your system's native webview. The result is a **~2MB binary** that consumes a fraction of the RAM and CPU.
- **🎨 Chameleon UI:** Purabo uses heuristic brand-analysis to dynamically theme its own interface and the resulting apps to match the target's identity.
- **🧪 "Zero-Bloat" Minimalist Mode:** Surgically remove web clutter. Injected CSS presets strip sidebars, footers, and ad banners, turning noisy websites into focused, high-end professional tools.
- **🛡️ Process Isolation & Privacy:** Every forged app runs in its own secure sandbox with isolated storage. All compilation happens **locally** on your machine—no cloud telemetry, no background trackers.
- **⚡ OS Integration (First-Class Citizen):** Forged apps aren't just bookmarks. They are real binaries with dedicated taskbar entries, system menu shortcuts, and full Alt-Tab support.
- **⌨️ In-App Native Bridge:** Every app includes a built-in command palette (`Cmd+K`) for system-level actions (Copy URL, Hard Reload, Reset Engine).
- **🔧 Zero-Config Build Toolchain:** The internal **System Doctor** audits and provisions your environment with one click, automating the complexity of Rust compilation.

## ✨ Core Experience

- **Universal Resolver:** Intelligent URL ingestion with real-time asset discovery.
- **Background Engine:** Minimize the forge process and continue your workflow while the binary compiles.
- **Surgical Cleanup:** A built-in uninstaller that removes binaries, icons, manifests, and OS shortcuts.

## 🏗️ Technical Architecture

Purabo is engineered for longevity and community extensibility:

- **Adapter Mindset:** Decoupled `ForgeEngine` and `SystemIntegration` traits allow for seamless engine swaps or new OS support.
- **Industrial Observability:** Full telemetry using the `tracing` framework for granular execution tracking.
- **Manifest Persistence:** Standalone apps are tracked via JSON manifests, ensuring total system transparency.

## 🚀 Getting Started

### Prerequisites
- **Rust** (Stable)
- **Node.js / pnpm**
- **Linux:** System dependencies (WebKit2GTK) are managed automatically via the internal Diagnostic tool.

### Installation & Development
```bash
git clone https://github.com/Bobeta/purabo.git
cd purabo
pnpm install
pnpm tauri dev
```

## 🛠️ Roadmap & Contribution
Purabo is currently optimized for **Linux**, with adapters for **macOS** and **Windows** in active development. We welcome contributions to finalize these platform bridges! See [CONTRIBUTING.md](./CONTRIBUTING.md).

---
Built with ❤️ for the Developer Community.
