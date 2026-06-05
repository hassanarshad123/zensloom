//! Shareable links via the user's own S3 bucket (BYOK storage).
//!
//! The exported MP4 is uploaded directly to S3 with a SigV4-signed PUT (no AWS
//! SDK — the official crates require a newer rustc than we pin, and their default
//! crypto needs NASM on Windows). Credentials are stored encrypted via DPAPI.
//! The returned link points at the public object; the embed code points at the
//! Zensloom-branded `player.html` hosted in the same bucket.

use std::path::PathBuf;

use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use specta::Type;
use tauri::{AppHandle, Manager};
use zensloom_secrets::SecretStore;

type HmacSha256 = Hmac<Sha256>;

const KEY_ACCESS: &str = "s3_access_key";
const KEY_SECRET: &str = "s3_secret_key";
const KEY_REGION: &str = "s3_region";
const KEY_BUCKET: &str = "s3_bucket";

fn secrets_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("Failed to get app data directory")
        .join("secrets.dat")
}

#[derive(Serialize, Deserialize, Type, Debug)]
pub struct S3Config {
    pub region: String,
    pub bucket: String,
    pub configured: bool,
}

#[derive(Serialize, Deserialize, Type, Debug)]
pub struct ShareResult {
    pub id: String,
    pub video_url: String,
    pub player_url: String,
    pub embed_code: String,
}

#[tauri::command]
#[specta::specta]
pub async fn set_s3_config(
    app: AppHandle,
    access_key: String,
    secret_key: String,
    region: String,
    bucket: String,
) -> Result<(), String> {
    let store = SecretStore::new(secrets_path(&app));
    store.store(KEY_ACCESS, access_key.trim()).map_err(|e| e.to_string())?;
    store.store(KEY_SECRET, secret_key.trim()).map_err(|e| e.to_string())?;
    store.store(KEY_REGION, region.trim()).map_err(|e| e.to_string())?;
    store.store(KEY_BUCKET, bucket.trim()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn get_s3_config(app: AppHandle) -> Result<S3Config, String> {
    let store = SecretStore::new(secrets_path(&app));
    let region = store.load(KEY_REGION).map_err(|e| e.to_string())?.unwrap_or_default();
    let bucket = store.load(KEY_BUCKET).map_err(|e| e.to_string())?.unwrap_or_default();
    let has_access = store.has(KEY_ACCESS).map_err(|e| e.to_string())?;
    let configured = has_access && !bucket.is_empty() && !region.is_empty();
    Ok(S3Config { region, bucket, configured })
}

#[tauri::command]
#[specta::specta]
pub async fn delete_s3_config(app: AppHandle) -> Result<(), String> {
    let store = SecretStore::new(secrets_path(&app));
    for k in [KEY_ACCESS, KEY_SECRET, KEY_REGION, KEY_BUCKET] {
        let _ = store.delete(k);
    }
    Ok(())
}

/// Upload `file_path` to the configured bucket and return its shareable links.
#[tauri::command]
#[specta::specta]
pub async fn share_to_s3(app: AppHandle, file_path: String) -> Result<ShareResult, String> {
    let store = SecretStore::new(secrets_path(&app));
    let access_key = store
        .load(KEY_ACCESS)
        .map_err(|e| e.to_string())?
        .ok_or("Sharing is not set up. Add your S3 details in Settings → Sharing.")?;
    let secret_key = store
        .load(KEY_SECRET)
        .map_err(|e| e.to_string())?
        .ok_or("Sharing is not set up. Add your S3 details in Settings → Sharing.")?;
    let region = store
        .load(KEY_REGION)
        .map_err(|e| e.to_string())?
        .filter(|r| !r.is_empty())
        .ok_or("S3 region is not set.")?;
    let bucket = store
        .load(KEY_BUCKET)
        .map_err(|e| e.to_string())?
        .filter(|b| !b.is_empty())
        .ok_or("S3 bucket is not set.")?;

    let id = uuid::Uuid::new_v4().simple().to_string();
    let key = format!("shares/{id}.mp4");

    let body = tokio::fs::read(&file_path)
        .await
        .map_err(|e| format!("Could not read the exported video: {e}"))?;

    tracing::info!(bytes = body.len(), key = %key, "Uploading share to S3");
    s3_put(&access_key, &secret_key, &region, &bucket, &key, "video/mp4", body).await?;

    let base = format!("https://{bucket}.s3.{region}.amazonaws.com");
    let video_url = format!("{base}/{key}");
    let player_url = format!("{base}/player.html?v={id}");
    let embed_code = format!(
        "<iframe src=\"{player_url}\" width=\"640\" height=\"360\" allowfullscreen style=\"border:0;border-radius:12px\"></iframe>"
    );

    tracing::info!(video_url = %video_url, "Share upload complete");
    Ok(ShareResult { id, video_url, player_url, embed_code })
}

fn hmac(key: &[u8], msg: &[u8]) -> Vec<u8> {
    let mut mac = HmacSha256::new_from_slice(key).expect("hmac accepts any key length");
    mac.update(msg);
    mac.finalize().into_bytes().to_vec()
}

fn sha256_hex(data: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(data);
    hex::encode(h.finalize())
}

/// SigV4-signed S3 PUT with an unsigned payload (validated against real S3).
async fn s3_put(
    access_key: &str,
    secret_key: &str,
    region: &str,
    bucket: &str,
    key: &str,
    content_type: &str,
    body: Vec<u8>,
) -> Result<(), String> {
    let host = format!("{bucket}.s3.{region}.amazonaws.com");
    let now = chrono::Utc::now();
    let amzdate = now.format("%Y%m%dT%H%M%SZ").to_string();
    let datestamp = now.format("%Y%m%d").to_string();
    let payload_hash = "UNSIGNED-PAYLOAD";

    let canonical_uri = format!("/{key}");
    let canonical_headers = format!(
        "content-type:{content_type}\nhost:{host}\nx-amz-content-sha256:{payload_hash}\nx-amz-date:{amzdate}\n"
    );
    let signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date";
    let canonical_request =
        format!("PUT\n{canonical_uri}\n\n{canonical_headers}\n{signed_headers}\n{payload_hash}");

    let scope = format!("{datestamp}/{region}/s3/aws4_request");
    let string_to_sign = format!(
        "AWS4-HMAC-SHA256\n{amzdate}\n{scope}\n{}",
        sha256_hex(canonical_request.as_bytes())
    );

    let k_date = hmac(format!("AWS4{secret_key}").as_bytes(), datestamp.as_bytes());
    let k_region = hmac(&k_date, region.as_bytes());
    let k_service = hmac(&k_region, b"s3");
    let k_signing = hmac(&k_service, b"aws4_request");
    let signature = hex::encode(hmac(&k_signing, string_to_sign.as_bytes()));

    let authorization = format!(
        "AWS4-HMAC-SHA256 Credential={access_key}/{scope}, SignedHeaders={signed_headers}, Signature={signature}"
    );

    let url = format!("https://{host}/{key}");
    let resp = reqwest::Client::new()
        .put(&url)
        .header("content-type", content_type)
        .header("x-amz-content-sha256", payload_hash)
        .header("x-amz-date", &amzdate)
        .header("authorization", authorization)
        .body(body)
        .send()
        .await
        .map_err(|e| format!("Upload failed (network): {e}"))?;

    let status = resp.status();
    if status.is_success() {
        Ok(())
    } else {
        let text = resp.text().await.unwrap_or_default();
        Err(format!("Upload rejected by S3 ({status}): {text}"))
    }
}
