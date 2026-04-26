mod commands;
mod state;
mod engine;
mod app_manager;
mod integration;
mod error;

pub use error::{PuraboError, Result};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

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
    // Initialize professional logging
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
