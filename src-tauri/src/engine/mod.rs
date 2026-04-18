use async_trait::async_trait;
use std::path::PathBuf;
use tauri::Window;

/// The `ForgeEngine` trait provides an abstraction layer for building native applications.
/// 
/// Implementing this trait allows for different compilation backends (e.g., Pake, 
/// Native Rust, or custom Chromium-based builders) to be swapped seamlessly.
#[async_trait]
pub trait ForgeEngine: Send + Sync {
    /// Returns the unique machine-readable identifier for this engine.
    fn id(&self) -> &str;

    /// Executes the primary forge (compilation) process.
    /// 
    /// # Arguments
    /// * `window` - The Tauri window handle for emitting progress events.
    /// * `url` - The source web URL to be wrapped.
    /// * `name` - The user-defined name of the resulting application.
    /// * `icon_path` - Optional path to a local PNG file to be used as the app icon.
    /// * `inject_css_path` - Optional path to a local CSS file for style overrides.
    /// * `output_dir` - The directory where the resulting binary should be stored.
    async fn forge(
        &self,
        window: &Window,
        url: &str,
        name: &str,
        icon_path: Option<PathBuf>,
        inject_css_path: Option<PathBuf>,
        output_dir: &PathBuf,
    ) -> Result<PathBuf, String>;
}

pub mod pake;
