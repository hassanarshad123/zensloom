// Zensloom v1.0: Free & open source. No cloud license management.

export default function Page() {
	return (
		<div class="cap-settings-page flex relative flex-col gap-3 items-center p-4 mx-auto h-full custom-scroll">
			<div class="flex justify-center items-center w-full h-screen">
				<div class="flex flex-col items-center p-6 mx-auto space-y-3 w-full max-w-md text-white rounded-3xl border bg-gray-2 border-gray-3">
					<div class="flex flex-col gap-2 items-center">
						<h3 class="text-2xl font-medium text-gray-12">Zensloom v1.0</h3>
					</div>
					<p class="text-center text-gray-11">
						Zensloom is{" "}
						<span class="font-semibold text-blue-500">
							free and open source
						</span>
						. No license key required.
					</p>
					<p class="text-sm text-center text-gray-10">
						Licensed under AGPLv3. For commercial licensing options, visit a
						future version.
					</p>
				</div>
			</div>
		</div>
	);
}
