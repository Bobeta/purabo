use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use std::fs;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppManifest {
    pub name: String,
    pub url: String,
    pub engine: String,
    pub version: String,
    pub created_at: u64,
    pub icon_path: Option<PathBuf>,
}

pub struct AppManager {
    pub apps_dir: PathBuf,
}

impl AppManager {
    pub fn new() -> Result<Self, String> {
        let apps_dir = dirs::data_dir()
            .map(|d| d.join("purabo").join("apps"))
            .ok_or("Could not determine apps directory")?;
        
        fs::create_dir_all(&apps_dir).map_err(|e| e.to_string())?;
        
        Ok(Self { apps_dir })
    }

    pub fn save_manifest(&self, manifest: &AppManifest) -> Result<(), String> {
        let safe_name = manifest.name.to_lowercase().replace(' ', "");
        let manifest_path = self.apps_dir.join(format!("{}.json", safe_name));
        let json = serde_json::to_string_pretty(manifest).map_err(|e| e.to_string())?;
        fs::write(manifest_path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_manifest(&self, name: &str) -> Option<AppManifest> {
        let safe_name = name.to_lowercase().replace(' ', "");
        let manifest_path = self.apps_dir.join(format!("{}.json", safe_name));
        if let Ok(content) = fs::read_to_string(manifest_path) {
            serde_json::from_str(&content).ok()
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_manifest_serialization() {
        let manifest = AppManifest {
            name: "Test App".into(),
            url: "https://test.com".into(),
            engine: "pake".into(),
            version: "1.0.0".into(),
            created_at: 12345678,
            icon_path: Some(PathBuf::from("/tmp/icon.png")),
        };

        let json = serde_json::to_string(&manifest).unwrap();
        let decoded: AppManifest = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.name, "Test App");
        assert_eq!(decoded.engine, "pake");
    }

    #[test]
    fn test_app_manager_save_load() {
        let dir = tempdir().unwrap();
        let manager = AppManager { apps_dir: dir.path().to_path_buf() };
        
        let manifest = AppManifest {
            name: "Purabo App".into(),
            url: "https://purabo.com".into(),
            engine: "test".into(),
            version: "1.0.0".into(),
            created_at: 100,
            icon_path: None,
        };

        manager.save_manifest(&manifest).unwrap();
        let loaded = manager.get_manifest("Purabo App").unwrap();
        assert_eq!(loaded.url, "https://purabo.com");
    }
}
