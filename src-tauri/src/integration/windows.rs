use super::SystemIntegration;
use std::path::PathBuf;
use std::process::Command;

pub struct WindowsIntegration;

impl SystemIntegration for WindowsIntegration {
    fn register(&self, name: &str, binary_path: &PathBuf, _icon_path: Option<&PathBuf>) -> Result<(), String> {
        let start_menu = dirs::data_dir()
            .map(|d| d.join("Microsoft").join("Windows").join("Start Menu").join("Programs"))
            .ok_or("Could not find Windows Start Menu folder")?;

        let shortcut_path = start_menu.join(format!("{}.lnk", name));
        let ps_script = format!(
            "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('{}'); $s.TargetPath = '{}'; $s.Save()",
            shortcut_path.to_string_lossy(),
            binary_path.to_string_lossy()
        );

        // Execute PowerShell to create a native Windows Shortcut
        let status = Command::new("powershell")
            .args(["-Command", &ps_script])
            .status()
            .map_err(|e| format!("Failed to create Windows shortcut: {}", e))?;

        if !status.success() {
            return Err("Failed to register app in Windows Start Menu".into());
        }

        Ok(())
    }

    fn unregister(&self, name: &str) -> Result<(), String> {
        let start_menu = dirs::data_dir()
            .map(|d| d.join("Microsoft").join("Windows").join("Start Menu").join("Programs"))
            .ok_or("Could not find Windows Start Menu folder")?;

        let shortcut_path = start_menu.join(format!("{}.lnk", name));
        if shortcut_path.exists() {
            std::fs::remove_file(shortcut_path).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}
