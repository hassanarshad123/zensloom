// Zensloom v1.0 is local-only. No cloud authentication required.
// This stub preserves the AuthStore type so existing store/settings code compiles,
// but all methods return "not authenticated" / no-op.

use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::{AppHandle, Runtime};

/// Minimal auth store retained for store compatibility.
/// In v1.0 local-only mode this is always `None`.
#[derive(Serialize, Deserialize, Type, Debug)]
pub struct AuthStore {
    pub user_id: Option<String>,
}

impl AuthStore {
    pub fn load<R: Runtime>(_app: &AppHandle<R>) -> Result<Option<Self>, String> {
        Ok(None)
    }

    pub fn get<R: Runtime>(_app: &AppHandle<R>) -> Result<Option<Self>, String> {
        Ok(None)
    }

    pub fn set(_app: &AppHandle, _value: Option<Self>) -> Result<(), String> {
        // No-op in local-only mode
        Ok(())
    }

    pub fn is_upgraded(&self) -> bool {
        // Local-only: all features unlocked
        true
    }

    pub async fn update_auth_plan(_app: &AppHandle) -> Result<(), String> {
        // No-op in local-only mode
        Ok(())
    }
}
