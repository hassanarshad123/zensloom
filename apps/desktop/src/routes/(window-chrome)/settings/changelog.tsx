// Zensloom v1.0: Changelog served locally since cloud API is unavailable.

import * as shell from "@tauri-apps/plugin-shell";
import { Button } from "@zensloom/ui-solid";
import { SettingsPageContent } from "./Setting";

export default function Page() {
	return (
		<div class="zensloom-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent class="max-w-none">
				<div class="flex flex-col gap-6 text-sm font-normal animate-in fade-in">
					<div class="space-y-4">
						<h3 class="text-lg font-semibold tracking-tight text-gray-12">
							Zensloom v1.0
						</h3>
						<p class="text-sm leading-relaxed text-gray-10">
							Initial release. Free, open-source, local-only screen recorder for
							Windows.
						</p>
						<ul class="space-y-2 text-sm text-gray-10 list-disc list-inside">
							<li>Screen, window, and region capture</li>
							<li>Webcam overlay with background removal</li>
							<li>Built-in video editor</li>
							<li>Local export (MP4, GIF, WebM)</li>
							<li>No cloud, no accounts, no telemetry</li>
						</ul>
						<div class="pt-4">
							<Button
								variant="gray"
								size="md"
								onClick={() =>
									shell.open("https://github.com/ZensbotLLC/Zensloom/releases")
								}
							>
								View all releases on GitHub
							</Button>
						</div>
					</div>
				</div>
			</SettingsPageContent>
		</div>
	);
}
