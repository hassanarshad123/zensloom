// Zensloom v1.0: Google Drive integration not available. Placeholder.

import { Section, SettingsPageContent } from "../Setting";
import { IntegrationConfigHeader } from "./config-header";

export default function GoogleDriveConfigPage() {
	return (
		<div class="cap-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent>
				<IntegrationConfigHeader title="Google Drive" />
				<Section
					title="Not Available"
					description="Google Drive integration will be available in a future version of Zensloom."
				>
					<div class="p-4 rounded-lg border bg-gray-2 border-gray-3">
						<p class="text-sm text-gray-10">
							Zensloom v1.0 is local-only. All recordings are stored on your
							machine.
						</p>
					</div>
				</Section>
			</SettingsPageContent>
		</div>
	);
}
