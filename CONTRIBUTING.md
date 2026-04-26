# Contributing to Purabo App Factory ⚒️

First off, thank you for considering contributing to Purabo! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 🚀 Vision
Purabo aims to be the standard "App Factory" for the web. We want to provide a zero-config, premium experience for turning any URL into a lightweight, standalone native application.

## 🛠️ How You Can Help

### 1. Cross-Platform Adapters (High Priority)
Purabo is currently fully functional on **Linux**. We are looking for contributors to help finalize the adapters for:
- **macOS:** Further refinement of the `SystemIntegration` trait in `macos.rs`.
- **Windows:** Further refinement of the `SystemIntegration` trait in `windows.rs`.

### 2. The Engine Room
Our build logic is abstracted via the `ForgeEngine` trait. We'd love to see:
- Native Rust webview builders.
- Support for custom Chromium flags.
- Advanced icon processing.
- New **Minimalist Injection** presets for popular websites.

### 3. The Native Bridge
Improve the in-app command palette (`bridge.js`) by adding more native-like features:
- In-app search.
- Window management (resize/move).
- Local notifications.

### 4. Visual Polish
The "Stealth UI" is built with Tailwind CSS 4 and Motion. Feel free to propose transitions or aesthetic improvements that maintain the high-end feel.

## 🏗️ Development Setup

1. **Prerequisites:**
   - Rust (latest stable)
   - Node.js & pnpm
   - WebKit2GTK (for Linux)

2. **Clone & Install:**
   ```bash
   git clone https://github.com/Bobeta/purabo.git
   cd purabo
   pnpm install
   ```

3. **Run in Dev Mode:**
   ```bash
   pnpm tauri dev
   ```

## 📜 Standards
- **Idiomatic Rust:** We follow the standard Rust style. Use `cargo fmt` and `cargo clippy`.
- **Clean Architecture:** Respect the Adapter Pattern. Logic specific to a tool or OS should stay in its respective module.
- **No AI mentions:** Ensure code comments and UI strings use professional industrial terminology.

## 🤝 Code of Conduct
Please be respectful and professional. We are building this for everyone.

---
Built with ❤️ by the Purabo Community.
