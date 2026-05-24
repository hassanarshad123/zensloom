// Zensloom v1.0: local-only mode. Cloud API client is disabled.
// This stub provides the AuthedApiError type and ManagerExt trait needed
// by other modules to compile.

use tauri::Runtime;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthedApiError {
    #[error("User is not authenticated or credentials have expired!")]
    InvalidAuthentication,
    #[error("User needs to upgrade their account to use this feature!")]
    UpgradeRequired,
    #[error("App state is still initializing")]
    AppStateUnavailable,
    #[error("AuthedApiError/Request: {0}")]
    Request(reqwest::Error),
    #[error("AuthedApiError/Deserialization: {0}")]
    Deserialization(#[from] serde_json::Error),
    #[error("The request has timed out")]
    Timeout,
    #[error("AuthedApiError/Other: {0}")]
    Other(String),
}

impl From<reqwest::Error> for AuthedApiError {
    fn from(err: reqwest::Error) -> Self {
        match err {
            err if err.is_timeout() => AuthedApiError::Timeout,
            err => AuthedApiError::Request(err),
        }
    }
}

impl From<&'static str> for AuthedApiError {
    fn from(value: &'static str) -> Self {
        AuthedApiError::Other(value.into())
    }
}

impl From<String> for AuthedApiError {
    fn from(value: String) -> Self {
        AuthedApiError::Other(value)
    }
}

/// Extension trait for cloud API requests.
/// In Zensloom v1.0 local-only mode, all cloud API methods return errors.
pub trait ManagerExt {
    /// Send an authenticated API request to the cloud. Always fails in local-only mode.
    async fn authed_api_request(
        &self,
        path: impl Into<String> + Send,
        build: impl FnOnce(&reqwest::Client, String) -> reqwest::RequestBuilder + Send,
    ) -> Result<reqwest::Response, AuthedApiError>;

    /// Send an unauthenticated API request. Always fails in local-only mode.
    async fn api_request(
        &self,
        path: impl Into<String> + Send,
        build: impl FnOnce(&reqwest::Client, String) -> reqwest::RequestBuilder + Send,
    ) -> Result<reqwest::Response, AuthedApiError>;

    /// Build a shareable URL. Returns empty string in local-only mode.
    async fn make_app_url(&self, path: impl Into<String> + Send) -> String;
}

impl<R: Runtime> ManagerExt for tauri::AppHandle<R> {
    async fn authed_api_request(
        &self,
        _path: impl Into<String> + Send,
        _build: impl FnOnce(&reqwest::Client, String) -> reqwest::RequestBuilder + Send,
    ) -> Result<reqwest::Response, AuthedApiError> {
        Err(AuthedApiError::Other(
            "Cloud API is not available in Zensloom v1.0 local-only mode".to_string(),
        ))
    }

    async fn api_request(
        &self,
        _path: impl Into<String> + Send,
        _build: impl FnOnce(&reqwest::Client, String) -> reqwest::RequestBuilder + Send,
    ) -> Result<reqwest::Response, AuthedApiError> {
        Err(AuthedApiError::Other(
            "Cloud API is not available in Zensloom v1.0 local-only mode".to_string(),
        ))
    }

    async fn make_app_url(&self, _path: impl Into<String> + Send) -> String {
        String::new()
    }
}
