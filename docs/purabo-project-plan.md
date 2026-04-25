# Project "Purabo": The Modern Pake Wrapper

## Overview
**Purabo** is not just a utility; it is a "Professional App Factory." It aims to take the world-class efficiency of Pake and wrap it in an interface that feels as premium as Linear or Raycast.

## The 3-Step Flow
1.  **Paste:** User pastes a URL (e.g., `web.whatsapp.com`).
2.  **Customize:** Purabo automatically fetches the site title and favicon. The user can tweak the name, icon, and "Brand Color."
3.  **Build:** A single "Create App" button. Purabo handles system dependencies in the background and provides a smooth progress bar.

## Tech Stack
- **Frontend:** Next.js 16 (Turbopack), Tailwind CSS 4, Motion, Zustand.
- **Backend:** Rust, Tauri 2.0.
- **Engine:** Pake-CLI (Build Engine).

## Production Features
- **Adapter Architecture:** Decoupled engine and platform logic.
- **Persistent Library:** JSON manifests for tracking all forged applications.
- **Observability:** Structured logging with `tracing`.
- **Security:** Input sanitization and error hardening.
