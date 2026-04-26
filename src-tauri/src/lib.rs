mod commands;
mod state;
mod engine;
mod app_manager;
mod integration;
mod error;

pub use error::{PuraboError, Result};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};
use tauri::Manager;

use commands::{
    check_system, 
    forge_app, 
    heal_system, 
    reveal_in_folder, 
    launch_app, 
    fetch_metadata, 
    delete_app,
    get_data_dir,
    fetch_recipes
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::registry()
        .with(fmt::layer().with_thread_ids(true).with_target(false))
        .with(EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into()))
        .init();

    tracing::info!("Initializing Purabo App Factory Engine...");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            check_system, 
            heal_system, 
            forge_app,
            reveal_in_folder,
            launch_app,
            fetch_metadata,
            delete_app,
            get_data_dir,
            fetch_recipes
        ])
        .setup(|app| {
            // HARDENING: Force window size and position on launch to bypass stale state
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                    width: 1200.0,
                    height: 900.0,
                }));
                let _ = window.center();
                let _ = window.set_focus();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
