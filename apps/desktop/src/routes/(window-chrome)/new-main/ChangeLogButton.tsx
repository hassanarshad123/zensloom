// Zensloom v1.0: Changelog button navigates to local changelog page.
// No cloud API calls.

import { getCurrentWindow } from "@tauri-apps/api/window";
import Tooltip from "~/components/Tooltip";
import { commands } from "~/utils/tauri";
import IconLucideBell from "~icons/lucide/bell";

const ChangelogButton = () => {
	const handleChangelogClick = () => {
		commands.showWindow({ Settings: { page: "changelog" } });
		getCurrentWindow().hide();
	};

	return (
		<Tooltip openDelay={0} content="Changelog">
			<button
				type="button"
				onClick={handleChangelogClick}
				class="flex relative justify-center items-center size-5"
			>
				<IconLucideBell class="transition-colors text-gray-11 size-4 hover:text-gray-12" />
			</button>
		</Tooltip>
	);
};

export default ChangelogButton;
