use crate::{
    SegmentMedia,
    audio::{AudioSegment, AudioSegmentTrack},
};

pub fn get_audio_segments(segments: &[SegmentMedia]) -> Vec<AudioSegment> {
    segments
        .iter()
        .map(|s| AudioSegment {
            tracks: [
                s.audio.clone().map(|a| {
                    AudioSegmentTrack::new(
                        a,
                        |c| c.mic_volume_db,
                        |c| match c.mic_stereo_mode {
                            zensloom_project::StereoMode::Stereo => zensloom_audio::StereoMode::Stereo,
                            zensloom_project::StereoMode::MonoL => zensloom_audio::StereoMode::MonoL,
                            zensloom_project::StereoMode::MonoR => zensloom_audio::StereoMode::MonoR,
                        },
                        |o| o.mic,
                    )
                }),
                s.system_audio.clone().map(|a| -> AudioSegmentTrack {
                    AudioSegmentTrack::new(
                        a,
                        |c| c.system_volume_db,
                        |_| zensloom_audio::StereoMode::Stereo,
                        |o| o.system_audio,
                    )
                }),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>(),
        })
        .collect::<Vec<_>>()
}
