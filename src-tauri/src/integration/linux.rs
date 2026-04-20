use super::SystemIntegration;
use std::path::PathBuf;
use std::fs;

pub struct LinuxIntegration;

impl SystemIntegration for LinuxIntegration {
    fn register(&self, name: &str, binary_path: &PathBuf, icon_path: Option<&PathBuf>) -> Result<(), String> {
        let safe_name = name.to_lowercase().replace(' ', "");
        let desktop_content = format!(
            "[Desktop Entry]\nName={}\nExec={}\nIcon={}\nType=Application\nCategories=Utility;\nTerminal=false",
            name,
            binary_path.to_string_lossy(),
            icon_path.map(|p| p.to_string_lossy().to_string()).unwrap_or_else(|| "executable-binary".into())
        );
        
        if let Some(desktop_dir) = dirs::data_dir().map(|d| d.join("applications")) {
            fs::create_dir_all(&desktop_dir).map_err(|e| e.to_string())?;
            fs::write(desktop_dir.join(format!("{}.desktop", safe_name)), desktop_content).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    fn unregister(&self, name: &str) -> Result<(), String> {
        let safe_name = name.to_lowercase().replace(' ', "");
        if let Some(desktop_dir) = dirs::data_dir().map(|d| d.join("applications")) {
            let desktop_file = desktop_dir.join(format!("{}.desktop", safe_name));
            if desktop_file.exists() {
                fs::remove_file(desktop_file).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }
}
