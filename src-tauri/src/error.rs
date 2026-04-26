use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PuraboError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),

    #[error("Image error: {0}")]
    Image(#[from] image::ImageError),

    #[error("Engine error: {0}")]
    Engine(String),

    #[error("System error: {0}")]
    System(String),

    #[error("Metadata error: {0}")]
    Metadata(String),

    #[error("Process error: {0}")]
    Process(String),
}

impl Serialize for PuraboError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

pub type Result<T> = std::result::Result<T, PuraboError>;
