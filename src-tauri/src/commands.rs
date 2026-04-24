use std::process::{Command, Stdio};
use tauri::{Emitter, Window, AppHandle, WebviewWindowBuilder, WebviewUrl};
use serde::Serialize;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use std::fs;
use tracing::{info, error, warn};
use regex::Regex;
use crate::error::Result;
use crate::PuraboError;
use crate::engine::{ForgeEngine, pake::PakeEngine};
use crate::app_manager::{AppManager, AppManifest};
use crate::integration::get_platform_integration;

#[derive(Serialize, Clone)]
pub struct SystemCheck {
    pub name: String,
    pub installed: bool,
    pub description: String,
}

/// Sanitizes input strings to ensure filesystem and shell safety.
fn sanitize_input(input: &str) -> String {
    let re = Regex::new(r"[^a-zA-Z0-9\s-]").expect("regex_init_failed");
    re.replace_all(input, "").trim().to_string()
}

#[tauri::command]
pub fn check_system() -> Vec<SystemCheck> {
    info!("system_audit_started");
    let has_pkg = |pkg: &str| {
        Command::new("pkg-config")
            .arg("--exists")
            .arg(pkg)
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    };

    let has_cmd = |cmd: &str| {
        Command::new("which")
            .arg(cmd)
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    };

    vec![
        SystemCheck {
            name: "Rust Toolchain".into(),
            installed: has_cmd("rustc") && has_cmd("cargo"),
            description: "Binary compilation engine".into(),
        },
        SystemCheck {
            name: "Native Toolchain".into(),
            installed: has_cmd("gcc") && has_cmd("make"),
            description: "C-linkage and build tools".into(),
        },
        SystemCheck {
            name: "Runtime Manager".into(),
            installed: has_cmd("pnpm"),
            description: "Build pipeline orchestrator".into(),
        },
        SystemCheck {
            name: "WebKit2GTK 4.1".into(),
            installed: has_pkg("webkit2gtk-4.1"),
            description: "Native webview runtime".into(),
        },
    ]
}

#[tauri::command]
pub async fn heal_system() -> Result<String> {
    info!("system_healing_initiated");
    let distro = fs::read_to_string("/etc/os-release")
        .map_err(|e| PuraboError::System(format!("os_release_read_failed: {}", e)))?;
    
    if distro.contains("ID=ubuntu") || distro.contains("ID=debian") {
        let run_privileged = |args: &[&str]| {
            Command::new("pkexec")
                .args(args)
                .status()
                .map_err(|e| PuraboError::System(format!("privileged_exec_failed: {}", e)))
                .and_then(|s| if s.success() { Ok(()) } else { Err(PuraboError::System("permission_denied".into())) })
        };

        run_privileged(&["apt-get", "update"])?;
        run_privileged(&["apt-get", "install", "-y", 
            "build-essential", "libgtk-3-dev", "libwebkit2gtk-4.1-dev", 
            "libayatana-appindicator3-dev", "librsvg2-dev", "patchelf", "curl", "pkg-config"
        ])?;

        Ok("provisioning_success".into())
    } else {
        warn!("unsupported_distro_healing_attempt");
        Err(PuraboError::System("manual_intervention_required".into()))
    }
}

#[tauri::command]
pub async fn forge_app(window: Window, url: String, name: String, force_dark: bool) -> Result<String> {
    let sanitized_name = sanitize_input(&name);
    info!(target = %url, ident = %sanitized_name, "forge_sequence_started");
    
    let manager = AppManager::new().map_err(PuraboError::System)?;
    let engine = PakeEngine;
    let integration = get_platform_integration();
    
    window.emit("forge-progress", ("RESOLVER: Extracting Assets...".to_string(), 10)).ok();
    let metadata = fetch_metadata(url.clone()).await?;
    
    let mut icon_path = None;
    if let Some(icon_url) = metadata.icon_url {
        let client = reqwest::Client::new();
        if let Ok(res) = client.get(icon_url).send().await {
            if let Ok(bytes) = res.bytes().await {
                let p = manager.apps_dir.join(format!("{}.png", sanitized_name.to_lowercase().replace(' ', "_")));
                if fs::write(&p, bytes).is_ok() {
                    icon_path = Some(p);
                }
            }
        }
    }

    let mut inject_path = None;
    if force_dark {
        let css = "html, body { background-color: #000 !important; color-scheme: dark !important; }";
        let p = manager.apps_dir.join(format!("{}_theme.css", sanitized_name.to_lowercase().replace(' ', "_")));
        fs::write(&p, css)?;
        inject_path = Some(p);
    }

    let binary_path = engine.forge(&window, &url, &sanitized_name, icon_path.clone(), inject_path, &manager.apps_dir)
        .await
        .map_err(|e| {
            error!(err = %e, "compilation_failed");
            PuraboError::Engine(e)
        })?;

    let manifest = AppManifest {
        name: sanitized_name.clone(),
        url: url.clone(),
        engine: engine.id().to_string(),
        version: "1.0.0".into(),
        created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        icon_path,
    };
    manager.save_manifest(&manifest).map_err(PuraboError::System)?;

    window.emit("forge-progress", ("INTEGRATOR: Finalizing Registration...".to_string(), 90)).ok();
    integration.register(&sanitized_name, &binary_path, manifest.icon_path.as_ref())
        .map_err(PuraboError::System)?;

    info!(ident = %sanitized_name, "forge_sequence_complete");
    window.emit("forge-progress", ("COMPLETED: Application Ready".to_string(), 100)).ok();
    Ok(format!("{} ready", sanitized_name))
}

#[derive(Serialize, Clone, Debug)]
pub struct AppMetadata {
    pub name: String,
    pub icon_url: Option<String>,
    pub theme_color: String,
}

#[tauri::command]
pub async fn fetch_metadata(url: String) -> Result<AppMetadata> {
    info!(target = %url, "metadata_resolution_started");
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .user_agent("Mozilla/5.0 (Purabo App Forge)")
        .build()?;

    let res = client.get(&url).send().await?;
    let html = res.text().await?;
    
    let mut name = "Custom App".to_string();
    let mut icon_url = None;

    {
        let document = scraper::Html::parse_document(&html);
        let title_selector = scraper::Selector::parse("title").expect("selector_init_failed");
        let icon_selector = scraper::Selector::parse("link[rel~='icon']").expect("selector_init_failed");

        if let Some(title_element) = document.select(&title_selector).next() {
            let title_text = title_element.text().collect::<Vec<_>>().join("");
            name = title_text.split('|').next().unwrap_or(&title_text).trim().to_string();
            name = name.split('-').next().unwrap_or(&name).trim().to_string();
        }

        if let Some(icon_element) = document.select(&icon_selector).next() {
            if let Some(href) = icon_element.value().attr("href") {
                if let Ok(base_url) = url::Url::parse(&url) {
                    if let Ok(absolute_url) = base_url.join(href) {
                        icon_url = Some(absolute_url.to_string());
                    }
                }
            }
        }
    }

    if icon_url.is_none() {
        if let Ok(base_url) = url::Url::parse(&url) {
            icon_url = Some(format!("https://{}/favicon.ico", base_url.host_str().unwrap_or("")));
        }
    }

    let mut theme_color = "#8b5cf6".to_string();
    if let Some(ref icon) = icon_url {
        if let Ok(icon_res) = client.get(icon).send().await {
            if let Ok(bytes) = icon_res.bytes().await {
                if let Ok(img) = image::load_from_memory(&bytes) {
                    let buffer = img.to_rgba8();
                    let pixels = buffer.as_raw();
                    if let Ok(colors) = color_thief::get_palette(pixels, color_thief::ColorFormat::Rgba, 10, 2) {
                        if let Some(dominant) = colors.first() {
                            theme_color = format!("#{:02x}{:02x}{:02x}", dominant.r, dominant.g, dominant.b);
                        }
                    }
                }
            }
        }
    }

    Ok(AppMetadata { name, icon_url, theme_color })
}

#[tauri::command]
pub async fn launch_app(handle: AppHandle, url: String, name: String) -> Result<()> {
    let sanitized_name = sanitize_input(&name);
    info!(ident = %sanitized_name, "launch_invoked");
    
    let manager = AppManager::new().map_err(PuraboError::System)?;
    let safe_name = sanitized_name.to_lowercase().replace(' ', "");
    
    #[cfg(target_os = "linux")]
    let binary_path = manager.apps_dir.join(format!("{}.AppImage", safe_name));
    #[cfg(not(target_os = "linux"))]
    let binary_path = manager.apps_dir.join(&safe_name);
    
    if binary_path.exists() {
        Command::new(&binary_path)
            .spawn()
            .map_err(|e| {
                error!(err = %e, "process_spawn_failed");
                PuraboError::Process(format!("exec_failed: {}", e))
            })?;
        return Ok(());
    }

    warn!("binary_not_found_fallback_to_preview");
    WebviewWindowBuilder::new(
        &handle,
        format!("preview-{}", id_from_name(&sanitized_name)),
        WebviewUrl::External(url.parse().expect("url_parse_failed")),
    )
    .title(format!("{} (Preview)", sanitized_name))
    .inner_size(1200.0, 800.0)
    .build()?;
    Ok(())
}

fn id_from_name(name: &str) -> String {
    name.to_lowercase().replace(' ', "-")
}

#[tauri::command]
pub async fn delete_app(name: String) -> Result<()> {
    let sanitized_name = sanitize_input(&name);
    info!(ident = %sanitized_name, "uninstallation_started");
    
    let manager = AppManager::new().map_err(PuraboError::System)?;
    let integration = get_platform_integration();
    let safe_name = sanitized_name.to_lowercase().replace(' ', "");
    
    integration.unregister(&sanitized_name).map_err(PuraboError::System)?;

    let app_image = manager.apps_dir.join(format!("{}.AppImage", safe_name));
    if app_image.exists() { fs::remove_file(app_image)?; }

    let icon = manager.apps_dir.join(format!("{}.png", sanitized_name.to_lowercase().replace(' ', "_")));
    if icon.exists() { fs::remove_file(icon)?; }

    let manifest = manager.apps_dir.join(format!("{}.json", safe_name));
    if manifest.exists() { fs::remove_file(manifest)?; }

    Ok(())
}

#[tauri::command]
pub fn get_data_dir() -> Result<String> {
    dirs::data_dir()
        .map(|d| d.join("purabo").to_string_lossy().to_string())
        .ok_or_else(|| PuraboError::System("xdg_dir_resolution_failed".into()))
}

#[tauri::command]
pub fn reveal_in_folder(path: String) -> Result<()> {
    let abs_path = dirs::home_dir()
        .map(|p| p.join(path.replace("~/", "")))
        .ok_or_else(|| PuraboError::System("home_dir_resolution_failed".into()))?;
        
    let path_str = abs_path.to_string_lossy().to_string();
    info!(target_path = %path_str, "file_manager_reveal_invoked");

    #[cfg(target_os = "linux")]
    {
        if Command::new("gio").args(["open", &path_str]).spawn().is_ok() {
            return Ok(());
        }

        let file_managers = ["nautilus", "nemo", "thunar", "dolphin", "pcmanfm", "xdg-open"];
        for cmd in file_managers {
            if Command::new(cmd).arg(&path_str).spawn().is_ok() {
                return Ok(());
            }
        }
        return Err(PuraboError::System("file_manager_not_found".into()));
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(&path_str).spawn().map_err(|e| PuraboError::System(e.to_string()))?;
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer").arg(&path_str).spawn().map_err(|e| PuraboError::System(e.to_string()))?;
        return Ok(());
    }

    #[allow(unreachable_code)]
    Ok(())
}
