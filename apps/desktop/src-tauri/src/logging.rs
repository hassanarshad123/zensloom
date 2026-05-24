use crate::ArcLock;
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

async fn get_latest_log_file(app: &AppHandle) -> Option<PathBuf> {
    let logs_dir = app
        .state::<ArcLock<crate::App>>()
        .read()
        .await
        .logs_dir
        .clone();

    let entries = fs::read_dir(&logs_dir).ok()?;
    let mut log_files: Vec<_> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.is_file() && path.file_name()?.to_str()?.contains("cap-desktop.log") {
                let metadata = fs::metadata(&path).ok()?;
                let modified = metadata.modified().ok()?;
                Some((path, modified))
            } else {
                None
            }
        })
        .collect();

    log_files.sort_by_key(|b| std::cmp::Reverse(b.1));
    log_files.first().map(|(path, _)| path.clone())
}

pub async fn upload_log_file(app: &AppHandle) -> Result<(), String> {
    // Zensloom v1.0: local-only mode. Open the log file in the system file explorer
    // instead of uploading to a cloud endpoint.
    let log_file = get_latest_log_file(app).await.ok_or("No log file found")?;

    let log_dir = log_file
        .parent()
        .ok_or("Log file has no parent directory")?;

    app.opener()
        .open_path(log_dir.to_str().unwrap_or_default(), None::<String>)
        .map_err(|e| format!("Failed to open logs directory: {e}"))?;

    Ok(())
}
