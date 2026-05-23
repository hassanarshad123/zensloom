import { describe, expect, it, vi } from "vitest";

vi.mock("@zensloom/database", () => ({
	db: vi.fn(),
}));

vi.mock("@zensloom/env", () => ({
	serverEnv: vi.fn(() => ({})),
}));

vi.mock("@zensloom/utils", () => ({
	userIsPro: vi.fn(),
}));

vi.mock("@zensloom/web-backend", () => ({
	Storage: {},
}));

vi.mock("@deepgram/sdk", () => ({
	createClient: vi.fn(),
}));

vi.mock("@/lib/audio-enhance", () => ({
	ENHANCED_AUDIO_CONTENT_TYPE: "audio/mpeg",
	ENHANCED_AUDIO_EXTENSION: "mp3",
	enhanceAudioFromUrl: vi.fn(),
}));

vi.mock("@/lib/audio-extract", () => ({
	checkHasAudioTrack: vi.fn(),
	extractAudioFromUrl: vi.fn(),
}));

vi.mock("@/lib/generate-ai", () => ({
	startAiGeneration: vi.fn(),
}));

vi.mock("@/lib/media-client", () => ({
	checkHasAudioTrackViaMediaServer: vi.fn(),
	extractAudioViaMediaServer: vi.fn(),
	isMediaServerConfigured: vi.fn(),
	probeVideoViaMediaServer: vi.fn(),
}));

vi.mock("@/lib/server", () => ({
	runPromise: vi.fn(),
}));

vi.mock("@/lib/transcribe-utils", () => ({
	formatToWebVTT: vi.fn(),
}));

vi.mock("@/lib/video-storage", () => ({
	decodeStorageVideo: vi.fn(),
}));

vi.mock("workflow", () => ({
	FatalError: class FatalError extends Error {},
}));

import {
	AI_GENERATION_LANGUAGES,
	isAiGenerationLanguage,
	parseAiGenerationLanguage,
} from "@zensloom/web-domain";
import { getDeepgramTranscriptionOptions } from "@/workflows/transcribe";

describe("AI generation language support", () => {
	it("does not expose unsupported transcription languages", () => {
		expect(AI_GENERATION_LANGUAGES).not.toHaveProperty("pa");
		expect(isAiGenerationLanguage("pa")).toBe(false);
		expect(parseAiGenerationLanguage("pa")).toBe("auto");
	});

	it("constrains Deepgram auto-detection to detectable languages", () => {
		expect(getDeepgramTranscriptionOptions("auto")).toMatchObject({
			model: "nova-3",
			detect_language: expect.arrayContaining(["en", "es", "zh"]),
		});
	});

	it("passes explicit languages to Deepgram", () => {
		expect(getDeepgramTranscriptionOptions("zh")).toMatchObject({
			model: "nova-3",
			language: "zh",
		});
	});
});
