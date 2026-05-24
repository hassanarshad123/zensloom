// Zensloom v1.0: S3 integration not available. Placeholder.

import { Section, SettingsPageContent } from "../Setting";
import { IntegrationConfigHeader } from "./config-header";

export default function S3ConfigPage() {
	return (
		<div class="cap-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent>
				<IntegrationConfigHeader title="S3 Config" />
				<Section
					title="Not Available"
					description="S3 storage integration will be available in a future version of Zensloom."
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
