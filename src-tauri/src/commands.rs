use std::process::Command;
use tauri::{Emitter, Window, AppHandle, WebviewWindowBuilder, WebviewUrl};
use url::Url;
use serde::{Serialize, Deserialize};
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Recipe {
    pub name: String,
    pub url: String,
    pub icon: String,
    pub description: String,
}

fn sanitize_input(input: &str) -> String {
    let re = Regex::new(r"[^a-zA-Z0-9\s-]").expect("regex_init_failed");
    re.replace_all(input, "").trim().to_string()
}

const BRIDGE_JS: &str = r#"
(function() {
    console.log('Purabo Bridge Initialized');
    const overlay = document.createElement('div');
    overlay.id = 'purabo-palette';
    overlay.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);width:400px;background:#09090b;border:1px solid #27272a;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.5);z-index:999999;display:none;flex-direction:column;overflow:hidden;font-family:sans-serif;';
    overlay.innerHTML = `
        <div style="padding:16px;border-bottom:1px solid #27272a;display:flex;align-items:center;gap:12px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;box-shadow:0 0 10px #8b5cf6;"></div>
            <input id="purabo-input" placeholder="Type a command..." style="background:transparent;border:none;outline:none;color:#fafafa;font-size:14px;flex:1;" />
        </div>
        <div id="purabo-results" style="max-height:300px;overflow-y:auto;padding:8px;">
            <div class="purabo-item" data-cmd="copy" style="padding:10px 12px;border-radius:6px;color:#a1a1aa;font-size:13px;cursor:pointer;display:flex;justify-content:between;">
                <span>Copy URL</span>
                <span style="font-size:10px;opacity:0.5;">Enter</span>
            </div>
            <div class="purabo-item" data-cmd="reload" style="padding:10px 12px;border-radius:6px;color:#a1a1aa;font-size:13px;cursor:pointer;">
                <span>Hard Reload</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    const style = document.createElement('style');
    style.textContent = `
        .purabo-item:hover { background: #18181b; color: #fff !important; }
        #purabo-input::placeholder { color: #52525b; }
    `;
    document.head.appendChild(style);
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
            if (overlay.style.display === 'flex') document.getElementById('purabo-input').focus();
        }
        if (e.key === 'Escape') overlay.style.display = 'none';
    });
    overlay.addEventListener('click', (e) => {
        const item = e.target.closest('.purabo-item');
        if (!item) return;
        const cmd = item.dataset.cmd;
        if (cmd === 'copy') {
            navigator.clipboard.writeText(window.location.href);
            overlay.style.display = 'none';
        } else if (cmd === 'reload') {
            window.location.reload(true);
        }
    });
})();
"#;

#[tauri::command]
pub fn check_system() -> Vec<SystemCheck> {
    let has_pkg = |pkg: &str| {
        Command::new("pkg-config").arg("--exists").arg(pkg).status().map(|s| s.success()).unwrap_or(false)
    };
    let has_cmd = |cmd: &str| {
        Command::new("which").arg(cmd).status().map(|s| s.success()).unwrap_or(false)
    };
    vec![
        SystemCheck { name: "Rust Toolchain".into(), installed: has_cmd("rustc") && has_cmd("cargo"), description: "Binary compilation engine".into() },
        SystemCheck { name: "Native Toolchain".into(), installed: has_cmd("gcc") && has_cmd("make"), description: "C-linkage and build tools".into() },
        SystemCheck { name: "Runtime Manager".into(), installed: has_cmd("pnpm"), description: "Build pipeline orchestrator".into() },
        SystemCheck { name: "WebKit2GTK 4.1".into(), installed: has_pkg("webkit2gtk-4.1"), description: "Native webview runtime".into() },
    ]
}

#[tauri::command]
pub async fn heal_system() -> Result<String> {
    let distro = fs::read_to_string("/etc/os-release").map_err(|e| PuraboError::System(format!("os_release_read_failed: {}", e)))?;
    if distro.contains("ID=ubuntu") || distro.contains("ID=debian") {
        let run_privileged = |args: &[&str]| {
            Command::new("pkexec").args(args).status().map_err(|e| PuraboError::System(format!("privileged_exec_failed: {}", e)))
                .and_then(|s| if s.success() { Ok(()) } else { Err(PuraboError::System("permission_denied".into())) })
        };
        run_privileged(&["apt-get", "update"])?;
        run_privileged(&["apt-get", "install", "-y", "build-essential", "libgtk-3-dev", "libwebkit2gtk-4.1-dev", "libayatana-appindicator3-dev", "librsvg2-dev", "patchelf", "curl", "pkg-config"])?;
        Ok("provisioning_success".into())
    } else {
        Err(PuraboError::System("manual_intervention_required".into()))
    }
}

#[tauri::command]
pub async fn fetch_recipes() -> Result<Vec<Recipe>> {
    let url = "https://raw.githubusercontent.com/Bobeta/purabo/main/recipes.json";
    let client = reqwest::Client::builder().timeout(Duration::from_secs(3)).build()?;
    match client.get(url).send().await {
        Ok(res) => { if let Ok(recipes) = res.json::<Vec<Recipe>>().await { return Ok(recipes); } }
        Err(e) => { warn!(error = %e, "remote_recipe_fetch_failed_using_local"); }
    }
    Ok(vec![
        Recipe { name: "WhatsApp".into(), url: "https://web.whatsapp.com".into(), icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg".into(), description: "End-to-end encrypted messaging.".into() },
        Recipe { name: "Claude".into(), url: "https://claude.ai".into(), icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Claude_AI_logo.svg/1024px-Claude_AI_logo.svg.png".into(), description: "Contextual reasoning engine.".into() }
    ])
}

#[tauri::command]
pub async fn forge_app(window: Window, url: String, name: String, force_dark: bool, minimalist: bool) -> Result<String> {
    let sanitized_name = sanitize_input(&name);
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
                if let Ok(img) = image::load_from_memory(&bytes) {
                    let p = manager.apps_dir.join(format!("{}.png", sanitized_name.to_lowercase().replace(' ', "_")));
                    if img.save_with_format(&p, image::ImageFormat::Png).is_ok() {
                        icon_path = Some(p);
                    }
                }
            }
        }
    }

    let mut css_overrides = String::new();
    if force_dark { css_overrides.push_str("html, body { background-color: #000 !important; color-scheme: dark !important; } "); }
    if minimalist {
        if url.contains("whatsapp") { css_overrides.push_str("._3Y7_Y { display: none !important; } "); }
        else if url.contains("github") { css_overrides.push_str(".Header-item--full, .footer { display: none !important; } "); }
        else { css_overrides.push_str("footer, aside, .sidebar, .ads { display: none !important; } "); }
    }

    let mut inject_path = None;
    if !css_overrides.is_empty() {
        let p = manager.apps_dir.join(format!("{}_theme.css", sanitized_name.to_lowercase().replace(' ', "_")));
        fs::write(&p, css_overrides)?;
        inject_path = Some(p);
    }

    let bridge_path = manager.apps_dir.join(format!("{}_bridge.js", sanitized_name.to_lowercase().replace(' ', "_")));
    fs::write(&bridge_path, BRIDGE_JS)?;
    let final_inject = inject_path.or(Some(bridge_path));

    let binary_path = engine.forge(&window, &url, &sanitized_name, icon_path.clone(), final_inject, &manager.apps_dir)
        .await
        .map_err(|e| { error!(err = %e, "compilation_failed"); PuraboError::Engine(e) })?;

    let manifest = AppManifest { name: sanitized_name.clone(), url: url.clone(), engine: engine.id().to_string(), version: "1.0.0".into(), created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(), icon_path };
    manager.save_manifest(&manifest).map_err(PuraboError::System)?;

    window.emit("forge-progress", ("INTEGRATOR: Finalizing Registration...".to_string(), 90)).ok();
    integration.register(&sanitized_name, &binary_path, manifest.icon_path.as_ref()).map_err(PuraboError::System)?;

    window.emit("forge-progress", ("COMPLETED: Application Ready".to_string(), 100)).ok();
    Ok(format!("{} ready", sanitized_name))
}

#[derive(Serialize, Clone, Debug)]
pub struct AppMetadata { pub name: String, pub icon_url: Option<String>, pub theme_color: String }

#[tauri::command]
pub async fn fetch_metadata(url: String) -> Result<AppMetadata> {
    let client = reqwest::Client::builder().timeout(Duration::from_secs(5)).user_agent("Mozilla/5.0 (Purabo App Forge)").build()?;
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
                if let Ok(base_url) = url::Url::parse(&url) { if let Ok(absolute_url) = base_url.join(href) { icon_url = Some(absolute_url.to_string()); } }
            }
        }
    }
    if icon_url.is_none() {
        if let Ok(base_url) = url::Url::parse(&url) { icon_url = Some(format!("https://{}/favicon.ico", base_url.host_str().unwrap_or(""))); }
    }
    let mut theme_color = "#8b5cf6".to_string();
    if let Some(ref icon) = icon_url {
        if let Ok(icon_res) = client.get(icon).send().await {
            if let Ok(bytes) = icon_res.bytes().await {
                if let Ok(img) = image::load_from_memory(&bytes) {
                    let buffer = img.to_rgba8();
                    if let Ok(colors) = color_thief::get_palette(buffer.as_raw(), color_thief::ColorFormat::Rgba, 10, 2) {
                        if let Some(dominant) = colors.first() { theme_color = format!("#{:02x}{:02x}{:02x}", dominant.r, dominant.g, dominant.b); }
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
    let manager = AppManager::new().map_err(PuraboError::System)?;
    let safe_name = sanitized_name.to_lowercase().replace(' ', "");
    #[cfg(target_os = "linux")]
    let binary_path = manager.apps_dir.join(format!("{}.AppImage", safe_name));
    #[cfg(not(target_os = "linux"))]
    let binary_path = manager.apps_dir.join(&safe_name);
    if binary_path.exists() {
        Command::new(&binary_path).spawn().map_err(|e| { error!(err = %e, "process_spawn_failed"); PuraboError::Process(format!("exec_failed: {}", e)) })?;
        return Ok(());
    }
    let target_url = Url::parse(&url).map_err(|e| PuraboError::Metadata(format!("url_parse_failed: {}", e)))?;
    WebviewWindowBuilder::new(&handle, format!("preview-{}", id_from_name(&sanitized_name)), WebviewUrl::External(target_url)).title(format!("{} (Preview)", sanitized_name)).inner_size(1200.0, 800.0).build()?;
    Ok(())
}

fn id_from_name(name: &str) -> String { name.to_lowercase().replace(' ', "-") }

#[tauri::command]
pub async fn delete_app(name: String) -> Result<()> {
    let sanitized_name = sanitize_input(&name);
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
    dirs::data_dir().map(|d| d.join("purabo").to_string_lossy().to_string()).ok_or_else(|| PuraboError::System("xdg_dir_resolution_failed".into()))
}

#[tauri::command]
pub fn reveal_in_folder(path: String) -> Result<()> {
    let abs_path = dirs::home_dir().map(|p| p.join(path.replace("~/", ""))).ok_or_else(|| PuraboError::System("home_dir_resolution_failed".into()))?;
    let path_str = abs_path.to_string_lossy().to_string();
    #[cfg(target_os = "linux")]
    {
        if Command::new("gio").args(["open", &path_str]).spawn().is_ok() { return Ok(()); }
        let file_managers = ["nautilus", "nemo", "thunar", "dolphin", "pcmanfm", "xdg-open"];
        for cmd in file_managers { if Command::new(cmd).arg(&path_str).spawn().is_ok() { return Ok(()); } }
        return Err(PuraboError::System("file_manager_not_found".into()));
    }
    #[cfg(target_os = "macos")]
    { Command::new("open").arg(&path_str).spawn().map_err(|e| PuraboError::System(e.to_string()))?; Ok(()) }
    #[cfg(target_os = "windows")]
    { Command::new("explorer").arg(&path_str).spawn().map_err(|e| PuraboError::System(e.to_string()))?; Ok(()) }
    #[allow(unreachable_code)]
    Ok(())
}
