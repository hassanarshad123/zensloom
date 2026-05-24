// Zensloom v1.0: local-only mode. Cloud upload functionality is disabled.
// This stub provides the type signatures and no-op implementations needed
// by recording.rs to compile. All upload operations are no-ops.

use serde::Serialize;
use std::path::PathBuf;
use tauri::AppHandle;
use tokio::task::JoinHandle;

/// Stub for the segment uploader. In local-only mode, uploads are no-ops.
pub struct SegmentUploader {
    pub handle: JoinHandle<Result<(), String>>,
}

impl SegmentUploader {
    /// Spawns a no-op uploader. Returns an error so that callers don't consider
    /// the upload "succeeded" (which would trigger post-upload deletion of local files).
    pub fn spawn(
        _app: AppHandle,
        _video_id: String,
        _segment_rx: std::sync::mpsc::Receiver<zensloom_enc_ffmpeg::segmented_stream::SegmentCompletedEvent>,
        _finish_rx: Option<flume::Receiver<bool>>,
        _recording_dir: PathBuf,
        _video_upload_info: zensloom_project::VideoUploadInfo,
    ) -> Self {
        // Drain the segment receiver so producers don't block
        let rx = _segment_rx;
        Self {
            handle: tokio::spawn(async move {
                // Drain segments to unblock producers
                while rx.recv().is_ok() {}
                // Return error so upload is not considered "succeeded"
                // (prevents post-upload deletion of local recording files)
                Err("Cloud uploads are not available in Zensloom v1.0 local-only mode".to_string())
            }),
        }
    }
}

/// Stub for the instant multipart upload. In local-only mode this is a no-op.
pub struct InstantMultipartUpload {
    pub handle: JoinHandle<Result<(), String>>,
}

impl InstantMultipartUpload {
    pub fn spawn(
        _app: AppHandle,
        _file_path: PathBuf,
        _pre_created_video: zensloom_project::VideoUploadInfo,
        _recording_dir: PathBuf,
        _finish_rx: Option<flume::Receiver<bool>>,
    ) -> Self {
        Self {
            handle: tokio::spawn(async {
                // Return error so upload is not considered "succeeded"
                Err("Cloud uploads are not available in Zensloom v1.0 local-only mode".to_string())
            }),
        }
    }
}

/// No-op: emits upload completion event (cloud uploads disabled in v1.0).
pub fn emit_upload_complete(_app: &AppHandle, _video_id: &str) {
    // No-op in local-only mode
}

/// Compress an image file for thumbnail use. Returns the bytes of the compressed image.
/// This is kept as it's useful for local thumbnails too.
pub async fn compress_image(path: PathBuf) -> Result<Vec<u8>, String> {
    use image::{ImageReader, codecs::jpeg::JpegEncoder};
    use std::io::Cursor;

    let img = tokio::task::spawn_blocking(move || {
        ImageReader::open(&path)
            .map_err(|e| format!("Failed to open image: {e}"))?
            .decode()
            .map_err(|e| format!("Failed to decode image: {e}"))
    })
    .await
    .map_err(|e| format!("Task panicked: {e}"))??;

    let mut buf = Cursor::new(Vec::new());
    let encoder = JpegEncoder::new_with_quality(&mut buf, 80);
    img.write_with_encoder(encoder)
        .map_err(|e| format!("Failed to encode JPEG: {e}"))?;

    Ok(buf.into_inner())
}

/// No-op stub for singlepart upload. Returns an error since cloud uploads are disabled.
pub async fn singlepart_uploader<S>(
    _app: AppHandle,
    _request: crate::api::PresignedS3PutRequest,
    _content_length: u64,
    _body: S,
) -> Result<(), String>
where
    S: futures::Stream<Item = Result<bytes::Bytes, std::io::Error>> + Send + 'static,
{
    // Cloud uploads disabled in v1.0 local-only mode
    Err("Cloud uploads are not available in Zensloom v1.0 local-only mode".to_string())
}

/// No-op stub for creating/getting a video on the cloud.
pub async fn create_or_get_video(
    _app: &AppHandle,
    _is_screenshot: bool,
    _existing_id: Option<String>,
    _name: Option<String>,
    _meta: Option<crate::api::S3VideoMeta>,
    _organization_id: Option<String>,
) -> Result<zensloom_project::S3UploadMeta, String> {
    Err("Cloud uploads are not available in Zensloom v1.0 local-only mode".to_string())
}

/// No-op stub for creating/getting a video with mode on the cloud.
pub async fn create_or_get_video_with_mode(
    _app: &AppHandle,
    _is_screenshot: bool,
    _existing_id: Option<String>,
    _name: Option<String>,
    _meta: Option<crate::api::S3VideoMeta>,
    _organization_id: Option<String>,
    _mode: &str,
) -> Result<zensloom_project::S3UploadMeta, crate::web_api::AuthedApiError> {
    Err(crate::web_api::AuthedApiError::Other(
        "Cloud uploads are not available in Zensloom v1.0 local-only mode".to_string(),
    ))
}

/// Upload progress event stub (kept for specta type generation compatibility).
#[derive(Clone, Serialize, specta::Type, tauri_specta::Event)]
pub struct UploadProgressEvent {
    video_id: String,
    uploaded: String,
    total: String,
}

/// Stub for building video metadata from a file.
pub fn build_video_meta(path: &std::path::Path) -> Result<crate::api::S3VideoMeta, String> {
    use ffmpeg::ffi::AV_TIME_BASE;

    let input = ffmpeg::format::input(path).map_err(|e| format!("Failed to open video: {e}"))?;
    let duration_in_secs = input.duration() as f64 / AV_TIME_BASE as f64;

    let video_stream = input
        .streams()
        .best(ffmpeg::media::Type::Video)
        .ok_or("No video stream found")?;

    let decoder_params = video_stream.parameters();
    let codec_ctx = ffmpeg::codec::context::Context::from_parameters(decoder_params)
        .map_err(|e| format!("Failed to create codec context: {e}"))?;

    let video_decoder = codec_ctx
        .decoder()
        .video()
        .map_err(|e| format!("Failed to create video decoder: {e}"))?;

    Ok(crate::api::S3VideoMeta {
        duration_in_secs,
        width: video_decoder.width(),
        height: video_decoder.height(),
        fps: Some(f64::from(video_stream.avg_frame_rate()) as f32),
    })
}
