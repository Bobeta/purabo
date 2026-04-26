use std::path::PathBuf;

/// The `SystemIntegration` trait abstracts OS-level registration of forged applications.
/// 
/// This includes creating shortcuts in Start Menus, symlinking bundles in macOS, 
/// or generating .desktop files in Linux.
pub trait SystemIntegration: Send + Sync {
    /// Registers the forged application with the host operating system.
    fn register(&self, name: &str, binary_path: &PathBuf, icon_path: Option<&PathBuf>) -> Result<(), String>;

    /// Unregisters (uninstalls) the forged application from the host operating system.
    fn unregister(&self, name: &str) -> Result<(), String>;
}

pub mod linux;
#[allow(dead_code)]
pub mod macos;
#[allow(dead_code)]
pub mod windows;

/// Returns the appropriate `SystemIntegration` implementation for the current host OS.
pub fn get_platform_integration() -> Box<dyn SystemIntegration> {
    #[cfg(target_os = "linux")]
    return Box::new(linux::LinuxIntegration);
    
    #[cfg(target_os = "macos")]
    return Box::new(macos::MacOsIntegration);
    
    #[cfg(target_os = "windows")]
    return Box::new(windows::WindowsIntegration);
}
