import { Button } from "@zensloom/ui-solid";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { Input } from "~/routes/editor/ui";
import { generalSettingsStore } from "~/store";
import {
	deriveGeneralSettings,
	type GeneralSettingsStore,
	normalizeTranscriptionHints,
} from "~/utils/general-settings";
import { commands } from "~/utils/tauri";
import IconLucidePlus from "~icons/lucide/plus";
import IconLucideX from "~icons/lucide/x";
import { Section, SectionCard, SettingsPageContent } from "./Setting";

export default function TranscriptionSettings() {
	const [store] = createResource(() => generalSettingsStore.get());

	return (
		<Show when={store.state === "ready" && ([store()] as const)}>
			{(store) => <Inner initialStore={store()[0] ?? null} />}
		</Show>
	);
}

function Inner(props: { initialStore: GeneralSettingsStore | null }) {
	const [hints, setHints] = createSignal(
		deriveGeneralSettings(props.initialStore).transcriptionHints ?? [],
	);
	const [pendingHint, setPendingHint] = createSignal("");
	const [saveState, setSaveState] = createSignal<"idle" | "saving" | "saved">(
		"idle",
	);
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;

	createEffect(() => {
		setHints(
			deriveGeneralSettings(props.initialStore).transcriptionHints ?? [],
		);
	});

	const persist = (nextHints: string[]) => {
		const normalized = normalizeTranscriptionHints(nextHints);
		setSaveState("saving");

		if (saveTimeout) clearTimeout(saveTimeout);
		if (resetTimeout) clearTimeout(resetTimeout);

		saveTimeout = setTimeout(() => {
			void generalSettingsStore
				.set({
					transcriptionHints: normalized,
				})
				.then(() => {
					setSaveState("saved");
					resetTimeout = setTimeout(() => setSaveState("idle"), 1200);
				})
				.catch((error) => {
					console.error("Failed to save transcription hints", error);
					setSaveState("idle");
				});
		}, 250);
	};

	const addHint = () => {
		const value = pendingHint().replaceAll("\0", "").trim();
		if (!value) return;

		const nextHints = normalizeTranscriptionHints([...hints(), value]);
		if (nextHints.length === hints().length) {
			setPendingHint("");
			return;
		}

		setHints(nextHints);
		setPendingHint("");
		persist(nextHints);
	};

	const removeHint = (hintToRemove: string) => {
		const nextHints = hints().filter((hint) => hint !== hintToRemove);
		setHints(nextHints);
		persist(nextHints);
	};

	onCleanup(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
		if (resetTimeout) clearTimeout(resetTimeout);
	});

	return (
		<div class="zensloom-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent>
				<Section
					title="Transcription"
					description="Add names, spellings, domains, and capitalization preferences that caption generation should keep in mind."
				>
					<SectionCard padded class="space-y-3">
						<div class="flex items-center justify-between gap-3">
							<div class="flex flex-col gap-0.5 min-w-0">
								<p class="text-[13px] text-gray-12">Remembered terms</p>
								<p class="text-xs leading-snug text-gray-10">
									Add one term at a time to reduce typos and formatting
									mistakes.
								</p>
							</div>
							<div class="flex items-center gap-2">
								<Show when={hints().length > 0}>
									<Button
										variant="gray"
										size="sm"
										onClick={() => {
											setHints([]);
											persist([]);
										}}
									>
										Clear
									</Button>
								</Show>
								<span class="text-xs text-gray-11 min-w-15 text-right">
									{saveState() === "saving"
										? "Saving..."
										: saveState() === "saved"
											? "Saved"
											: ""}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<Input
								type="text"
								value={pendingHint()}
								onInput={(event) => setPendingHint(event.currentTarget.value)}
								onKeyDown={(event) => {
									if (event.key !== "Enter") return;
									event.preventDefault();
									addHint();
								}}
								placeholder="Add a term"
								spellcheck={false}
								autocapitalize="off"
								autocomplete="off"
								autocorrect="off"
								class="flex-1 px-3 py-2 bg-gray-1 border border-gray-3 rounded-md text-gray-12 placeholder:text-gray-10 focus:outline-hidden focus:ring-1 focus:ring-gray-8 hover:border-gray-6"
							/>
							<Button
								onClick={addHint}
								disabled={pendingHint().trim().length === 0}
								class="shrink-0"
							>
								<IconLucidePlus class="size-4" />
								Add
							</Button>
						</div>

						<p class="text-xs leading-relaxed text-gray-10">
							These hints are applied when you generate captions in the editor.
						</p>
					</SectionCard>
				</Section>

				<Show when={hints().length > 0}>
					<Section
						title="Active hints"
						right={
							<span class="text-xs text-gray-10">
								{hints().length} {hints().length === 1 ? "item" : "items"}
							</span>
						}
					>
						<SectionCard padded>
							<div class="flex flex-wrap gap-2">
								<For each={hints()}>
									{(hint) => (
										<button
											type="button"
											class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-gray-12 bg-gray-3 border border-gray-4 hover:bg-gray-4 transition-colors"
											onClick={() => removeHint(hint)}
										>
											<span>{hint}</span>
											<IconLucideX class="size-3" />
										</button>
									)}
								</For>
							</div>
						</SectionCard>
					</Section>
				</Show>

				<OpenAiApiKeySection />
			</SettingsPageContent>
		</div>
	);
}

type ApiKeyState =
	| "loading"
	| "not_configured"
	| "stored"
	| "saving"
	| "validating"
	| "error";

function OpenAiApiKeySection() {
	const [keyInput, setKeyInput] = createSignal("");
	const [state, setState] = createSignal<ApiKeyState>("loading");
	const [errorMessage, setErrorMessage] = createSignal("");

	onMount(() => {
		void checkKeyStatus();
	});

	const checkKeyStatus = async () => {
		try {
			const hasKey = await commands.getApiKeyStatus("openai");
			setState(hasKey ? "stored" : "not_configured");
		} catch (error) {
			console.error("Failed to check API key status", error);
			setState("not_configured");
		}
	};

	const saveKey = async () => {
		const key = keyInput().trim();
		if (!key) return;

		setErrorMessage("");
		setState("validating");

		try {
			await commands.validateOpenaiKey(key);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorMessage(message);
			setState("error");
			return;
		}

		setState("saving");

		try {
			await commands.storeApiKey("openai", key);
			setKeyInput("");
			setState("stored");
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorMessage(`Failed to store key: ${message}`);
			setState("error");
		}
	};

	const deleteKey = async () => {
		try {
			await commands.deleteApiKey("openai");
			setState("not_configured");
			setKeyInput("");
			setErrorMessage("");
		} catch (error) {
			console.error("Failed to delete API key", error);
		}
	};

	return (
		<Section
			title="OpenAI API Key"
			description="Provide your own OpenAI API key for cloud-based Whisper transcription."
		>
			<SectionCard padded class="space-y-3">
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<p class="text-[13px] text-gray-12">API Key</p>
						<Show when={state() === "stored"}>
							<span class="text-xs text-green-11 font-medium">
								Stored securely
							</span>
						</Show>
						<Show when={state() === "loading"}>
							<span class="text-xs text-gray-10">Checking...</span>
						</Show>
					</div>

					<Show when={state() !== "stored"}>
						<div class="flex items-center gap-2">
							<Input
								type="password"
								value={keyInput()}
								onInput={(event) => setKeyInput(event.currentTarget.value)}
								onKeyDown={(event) => {
									if (event.key !== "Enter") return;
									event.preventDefault();
									void saveKey();
								}}
								placeholder="sk-..."
								spellcheck={false}
								autocapitalize="off"
								autocomplete="off"
								autocorrect="off"
								disabled={state() === "validating" || state() === "saving"}
								class="flex-1 px-3 py-2 bg-gray-1 border border-gray-3 rounded-md text-gray-12 placeholder:text-gray-10 focus:outline-hidden focus:ring-1 focus:ring-gray-8 hover:border-gray-6"
							/>
							<Button
								onClick={() => void saveKey()}
								disabled={
									keyInput().trim().length === 0 ||
									state() === "validating" ||
									state() === "saving"
								}
								class="shrink-0"
							>
								{state() === "validating"
									? "Validating..."
									: state() === "saving"
										? "Saving..."
										: "Save"}
							</Button>
						</div>
					</Show>

					<Show when={state() === "stored"}>
						<div class="flex items-center gap-2">
							<p class="text-xs text-gray-10 flex-1">
								Your key is encrypted with Windows DPAPI and stored locally.
							</p>
							<Button variant="gray" size="sm" onClick={() => void deleteKey()}>
								<IconLucideX class="size-3" />
								Remove
							</Button>
						</div>
					</Show>

					<Show when={state() === "error" && errorMessage()}>
						<p class="text-xs text-red-11">{errorMessage()}</p>
					</Show>

					<p class="text-xs leading-relaxed text-gray-10">
						~$0.006/min of audio. Get a key at{" "}
						<a
							href="https://platform.openai.com/api-keys"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-11 hover:underline"
						>
							platform.openai.com
						</a>
					</p>
				</div>
			</SectionCard>
		</Section>
	);
}
