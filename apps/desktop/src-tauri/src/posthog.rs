// Zensloom v1.0: No telemetry. All PostHog functions are no-ops.
// This stub preserves the type signatures needed by recording.rs and recovery.rs.

use std::time::Duration;
use tauri::AppHandle;

#[derive(Debug)]
#[allow(dead_code)]
pub enum PostHogEvent {
    MultipartUploadComplete {
        duration: Duration,
        length: Duration,
        size: u64,
    },
    MultipartUploadFailed {
        duration: Duration,
        error: String,
    },
    RecordingStarted {
        mode: &'static str,
        target_kind: &'static str,
        has_camera: bool,
        has_mic: bool,
        has_system_audio: bool,
        target_fps: u32,
        target_width: u32,
        target_height: u32,
        fragmented: bool,
        custom_cursor_capture: bool,
    },
    RecordingCompleted {
        mode: &'static str,
        status: &'static str,
        duration_secs: u64,
        segment_count: u32,
        track_failure_count: u32,
        error_class: Option<String>,
        video_frames_captured: u64,
        video_frames_dropped: u64,
        drop_rate_pct: f64,
        capture_stalls_count: u64,
        capture_stalls_max_ms: u64,
        mixer_stalls_count: u64,
        mixer_stalls_max_ms: u64,
        audio_gaps_count: u64,
        audio_gaps_total_ms: u64,
        frame_drop_rate_high_count: u64,
        source_restarts_count: u64,
        muxer_crash_count: u64,
        audio_degraded_count: u64,
        dropped_mic_messages: u64,
    },
    RecordingMuxerCrashed {
        mode: &'static str,
        reason: String,
        seconds_into_recording: f64,
    },
    RecordingAudioDegraded {
        mode: &'static str,
        reason: String,
        seconds_into_recording: f64,
    },
    RecordingRecovered {
        trigger: &'static str,
        recovered_duration_secs: u64,
        segments_recovered: u32,
        validation_took_ms: u64,
    },
    RecordingRecoveryFailed {
        trigger: &'static str,
        reason: String,
    },
    RecordingDiskSpaceLow {
        mode: &'static str,
        bytes_remaining: u64,
    },
    RecordingDiskSpaceExhausted {
        mode: &'static str,
        bytes_remaining: u64,
    },
    RecordingDeviceLost {
        mode: &'static str,
        subsystem: String,
    },
    RecordingEncoderRebuilt {
        mode: &'static str,
        backend: String,
        attempt: u32,
    },
    RecordingSourceAudioReset {
        mode: &'static str,
        source: String,
        starvation_ms: u64,
    },
    RecordingCaptureTargetLost {
        mode: &'static str,
        target: String,
    },
}

pub fn init() {}

pub fn set_server_url(_url: &str) {}

pub fn set_telemetry_enabled(_enabled: bool) {}

pub fn telemetry_enabled() -> bool {
    false
}

pub fn async_capture_event(_app: &AppHandle, _event: PostHogEvent) {}
