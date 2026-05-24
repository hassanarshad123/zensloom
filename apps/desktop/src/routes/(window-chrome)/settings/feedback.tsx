import * as shell from "@tauri-apps/plugin-shell";
import { Button } from "@zensloom/ui-solid";
import { createResource, createSignal, For, Show } from "solid-js";
import toast from "solid-toast";

import { commands, type SystemDiagnostics } from "~/utils/tauri";
import { Section, SettingsPageContent } from "./Setting";

async function fetchDiagnostics(): Promise<SystemDiagnostics | null> {
	try {
		return await commands.getSystemDiagnostics();
	} catch (e) {
		console.error("Failed to fetch diagnostics:", e);
		return null;
	}
}

export default function FeedbackTab() {
	const [uploadingLogs, setUploadingLogs] = createSignal(false);
	const [diagnostics] = createResource(fetchDiagnostics);

	const handleUploadLogs = async () => {
		setUploadingLogs(true);
		try {
			await commands.uploadLogs();
			toast.success("Logs uploaded successfully");
		} catch (error) {
			toast.error("Failed to upload logs");
			console.error("Failed to upload logs:", error);
		} finally {
			setUploadingLogs(false);
		}
	};

	return (
		<div class="zensloom-settings-page flex flex-col w-full h-full custom-scroll">
			<SettingsPageContent>
				<Section
					title="Feedback"
					description="Zensloom v1.0 is local-only. To share feedback, please open a GitHub issue or join our community."
				>
					<div class="flex gap-2">
						<Button
							onClick={() =>
								shell.open("https://github.com/ZensbotLLC/Zensloom/issues")
							}
							size="md"
							variant="primary"
						>
							Open GitHub Issues
						</Button>
					</div>
				</Section>

				<Section
					title="Join the Community"
					description="Have questions, want to share ideas, or just hang out? Join the community."
				>
					<Button
						onClick={() => shell.open("https://cap.link/discord")}
						size="md"
						variant="gray"
					>
						Join Discord
					</Button>
				</Section>

				<Section
					title="Debug Information"
					description="Upload your logs to help us diagnose issues. No personal information is included."
				>
					<Button
						onClick={handleUploadLogs}
						size="md"
						variant="gray"
						disabled={uploadingLogs()}
					>
						{uploadingLogs() ? "Uploading..." : "Upload Logs"}
					</Button>
				</Section>

				<Section title="System Information">
					<Show
						when={!diagnostics.loading && diagnostics()}
						fallback={
							<p class="text-xs leading-relaxed text-gray-10">
								Loading system information...
							</p>
						}
					>
						{(diag) => {
							const d = diag() as Record<string, unknown>;
							const osVersion =
								"macosVersion" in d
									? (d.macosVersion as { displayName: string } | null)
									: "windowsVersion" in d
										? (d.windowsVersion as { displayName: string } | null)
										: null;
							const captureSupported =
								"screenCaptureSupported" in d
									? (d.screenCaptureSupported as boolean)
									: "graphicsCaptureSupported" in d
										? (d.graphicsCaptureSupported as boolean)
										: false;
							return (
								<div class="space-y-3 text-sm">
									<Show when={osVersion}>
										{(ver) => (
											<div class="space-y-1">
												<p class="text-gray-11 font-medium">Operating System</p>
												<p class="text-gray-10 bg-gray-2 px-2 py-1.5 rounded-sm font-mono text-xs">
													{ver().displayName}
												</p>
											</div>
										)}
									</Show>

									<div class="space-y-1">
										<p class="text-gray-11 font-medium">Capture Support</p>
										<div class="flex gap-2 flex-wrap">
											<span
												class={`px-2 py-1 rounded text-xs ${
													captureSupported
														? "bg-green-500/20 text-green-400"
														: "bg-red-500/20 text-red-400"
												}`}
											>
												Screen Capture:{" "}
												{captureSupported ? "Supported" : "Not Supported"}
											</span>
										</div>
									</div>

									<Show when={(d.availableEncoders as string[])?.length > 0}>
										<div class="space-y-1">
											<p class="text-gray-11 font-medium">Available Encoders</p>
											<div class="flex gap-1.5 flex-wrap">
												<For each={d.availableEncoders as string[]}>
													{(encoder) => (
														<span class="px-2 py-1 bg-gray-2 rounded-sm text-xs text-gray-10 font-mono">
															{encoder}
														</span>
													)}
												</For>
											</div>
										</div>
									</Show>
								</div>
							);
						}}
					</Show>
				</Section>
			</SettingsPageContent>
		</div>
	);
}
