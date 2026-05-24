// Zensloom v1.0: Cloud integrations not available. Placeholder page.

import { Section, SettingsPageContent } from "../Setting";

export default function AppsTab() {
	return (
		<div class="cap-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent>
				<Section
					title="Integrations"
					description="Cloud integrations (S3, Google Drive) will be available in a future version of Zensloom. v1.0 is local-only."
				>
					<div class="p-4 rounded-lg border bg-gray-2 border-gray-3">
						<p class="text-sm text-gray-10">
							No integrations are available in this version. All recordings are
							stored locally on your machine.
						</p>
					</div>
				</Section>
			</SettingsPageContent>
		</div>
	);
}
