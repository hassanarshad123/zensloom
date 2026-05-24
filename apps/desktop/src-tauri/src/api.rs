// Zensloom v1.0 is local-only. Cloud API endpoints are not available.
// This stub keeps the Organization type that may still be referenced
// by settings/store serialization.

use serde::{Deserialize, Serialize};
use specta::Type;

/// Video metadata for upload requests (kept for type compatibility).
#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct S3VideoMeta {
    #[serde(rename = "durationInSecs")]
    pub duration_in_secs: f64,
    pub width: u32,
    pub height: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fps: Option<f32>,
}

/// Presigned S3 PUT request method (kept for type compatibility).
#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PresignedS3PutRequestMethod {
    #[allow(unused)]
    Post,
    Put,
}

/// Presigned S3 PUT request (kept for type compatibility).
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresignedS3PutRequest {
    pub video_id: String,
    pub subpath: String,
    pub method: PresignedS3PutRequestMethod,
    #[serde(flatten)]
    pub meta: Option<S3VideoMeta>,
}

#[derive(Serialize, Deserialize, Type, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct OrganizationBrandColors {
    pub primary: Option<String>,
    pub secondary: Option<String>,
    pub accent: Option<String>,
    pub background: Option<String>,
}

fn default_organization_role() -> String {
    "member".to_string()
}

#[derive(Serialize, Deserialize, Type, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Organization {
    pub id: String,
    pub name: String,
    pub owner_id: String,
    #[serde(default = "default_organization_role")]
    pub role: String,
    #[serde(default)]
    pub can_edit_brand: bool,
    #[serde(default)]
    pub icon_url: Option<String>,
    #[serde(default)]
    pub brand_colors: OrganizationBrandColors,
}
