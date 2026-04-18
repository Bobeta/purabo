use super::ForgeEngine;
use async_trait::async_trait;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::{Emitter, Window};

/// PakeEngine is a ForgeEngine implementation that usesTw93's Pake-CLI.
/// It wraps any URL into a lightweight native binary using Rust and Tauri's webview.
pub struct PakeEngine;

#[async_trait]
impl ForgeEngine for PakeEngine {
    fn id(&self) -> &str {
        "pake"
    }

    async fn forge(
        &self,
        window: &Window,
        url: &str,
        name: &str,
        icon_path: Option<PathBuf>,
        inject_css_path: Option<PathBuf>,
        output_dir: &PathBuf,
    ) -> Result<PathBuf, String> {
        window.emit("forge-progress", ("ENGINE: Optimizing Build Pipeline...".to_string(), 30)).ok();

        // Use npx --yes to ensure non-interactive execution for senior-grade stability
        let mut cmd = Command::new("npx");
        cmd.args(["--yes", "pake-cli", url, "--name", name]);

        // Dynamically set build targets based on host OS
        #[cfg(target_os = "linux")]
        cmd.args(["--targets", "appimage"]);
        #[cfg(target_os = "macos")]
        cmd.args(["--targets", "dmg"]);
        #[cfg(target_os = "windows")]
        cmd.args(["--targets", "nsis"]);
        
        if let Some(ref p) = icon_path {
            cmd.arg("--icon").arg(p);
        }

        if let Some(ref p) = inject_css_path {
            cmd.arg("--inject").arg(p);
        }

        window.emit("forge-progress", ("ENGINE: Executing Native Compilation...".to_string(), 50)).ok();

        // Inherit IO for production visibility and debugging
        let status = cmd.current_dir(output_dir)
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .map_err(|e| format!("Runtime Engine failure: {}. Verify build toolchain.", e))?;

        if !status.success() {
            return Err("Pake compilation failed. Check system logs.".into());
        }

        let safe_name = name.to_lowercase().replace(' ', "");
        
        // Resolve platform-specific binary extension
        let binary_path = if cfg!(target_os = "linux") {
            output_dir.join(format!("{}.AppImage", safe_name))
        } else if cfg!(target_os = "macos") {
            output_dir.join(format!("{}.dmg", safe_name))
        } else {
            output_dir.join(format!("{}.exe", safe_name))
        };
        
        if binary_path.exists() {
            Ok(binary_path)
        } else {
            Err(format!("Binary verification failed: {:?} not found.", binary_path))
        }
    }
}
