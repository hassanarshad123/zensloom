use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Manager;
use zensloom_secrets::SecretStore;

fn get_secrets_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to get app data directory")
        .join("secrets.dat")
}

#[tauri::command]
#[specta::specta]
pub async fn store_api_key(app: AppHandle, provider: String, key: String) -> Result<(), String> {
    let store = SecretStore::new(get_secrets_path(&app));
    store
        .store(&format!("{provider}_api_key"), &key)
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_api_key_status(app: AppHandle, provider: String) -> Result<bool, String> {
    let store = SecretStore::new(get_secrets_path(&app));
    store
        .has(&format!("{provider}_api_key"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_api_key(app: AppHandle, provider: String) -> Result<(), String> {
    let store = SecretStore::new(get_secrets_path(&app));
    store
        .delete(&format!("{provider}_api_key"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn validate_openai_key(key: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.openai.com/v1/models")
        .header("Authorization", format!("Bearer {key}"))
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if resp.status().is_success() {
        Ok(())
    } else {
        Err(format!("Invalid API key (status {})", resp.status()))
    }
}
