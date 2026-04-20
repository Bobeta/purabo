use super::SystemIntegration;
use std::path::PathBuf;
use std::process::Command;

pub struct MacOsIntegration;

impl SystemIntegration for MacOsIntegration {
    fn register(&self, name: &str, binary_path: &PathBuf, _icon_path: Option<&PathBuf>) -> Result<(), String> {
        let user_apps = dirs::home_dir()
            .map(|d| d.join("Applications"))
            .ok_or("Could not find user Applications folder")?;

        if !user_apps.exists() {
            std::fs::create_dir_all(&user_apps).map_err(|e| e.to_string())?;
        }

        // On macOS, Pake creates a .app folder. We symlink it to the Applications directory.
        // This ensures the app is indexed by Spotlight and appears in Launchpad.
        let target_link = user_apps.join(format!("{}.app", name));
        
        if target_link.exists() {
            let _ = std::fs::remove_dir_all(&target_link);
        }

        // Use 'ln -s' for a clean system-level symlink
        let status = Command::new("ln")
            .args(["-s", &binary_path.to_string_lossy(), &target_link.to_string_lossy()])
            .status()
            .map_err(|e| format!("Failed to create macOS symlink: {}", e))?;

        if !status.success() {
            return Err("Failed to register app in macOS Applications folder".into());
        }

        Ok(())
    }

    fn unregister(&self, name: &str) -> Result<(), String> {
        let user_apps = dirs::home_dir()
            .map(|d| d.join("Applications"))
            .ok_or("Could not find user Applications folder")?;

        let target_link = user_apps.join(format!("{}.app", name));
        if target_link.exists() {
            std::fs::remove_dir_all(target_link).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}
