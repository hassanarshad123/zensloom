// Zensloom v1.0: Free & open source, local-only. No cloud upgrade flow.

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@zensloom/ui-solid";

export default function Page() {
	return (
		<div class="flex relative flex-col justify-center items-center p-5 mx-auto w-full h-full">
			<div class="flex flex-col items-center p-6 mx-auto space-y-4 w-full max-w-md rounded-3xl border bg-gray-2 border-gray-3">
				<h2 class="text-2xl font-medium text-gray-12">Zensloom v1.0</h2>
				<p class="text-center text-gray-11">
					Zensloom is free and open source. All features are included in this
					version. No upgrade needed.
				</p>
				<Button
					onClick={() => {
						getCurrentWindow().close();
					}}
					variant="primary"
					size="lg"
				>
					Close
				</Button>
			</div>
		</div>
	);
}
