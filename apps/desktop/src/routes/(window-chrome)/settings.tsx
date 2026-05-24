import { A, type RouteSectionProps, useNavigate } from "@solidjs/router";
import { getVersion } from "@tauri-apps/api/app";
import * as dialog from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { createResource, createSignal, For, Show, Suspense } from "solid-js";
import { ZensloomErrorBoundary } from "~/components/ErrorBoundary";
import IconLucideUserRound from "~icons/lucide/user-round";

export default function Settings(props: RouteSectionProps) {
	const navigate = useNavigate();
	const [version] = createResource(() => getVersion());
	const [isCheckingForUpdates, setIsCheckingForUpdates] = createSignal(false);

	const settingsItems = [
		{
			href: "general",
			name: "General",
			icon: IconCapSettings,
		},
		{
			href: "hotkeys",
			name: "Shortcuts",
			icon: IconCapHotkeys,
		},
		{
			href: "recordings",
			name: "Recordings",
			icon: IconLucideSquarePlay,
		},
		{
			href: "screenshots",
			name: "Screenshots",
			icon: IconLucideImage,
		},
		{
			href: "transcription",
			name: "Transcription",
			icon: IconCapCaptions,
		},
		{
			href: "license",
			name: "License",
			icon: IconLucideGift,
		},
		{
			href: "experimental",
			name: "Experimental",
			icon: IconCapSettings,
		},
		{
			href: "feedback",
			name: "Feedback",
			icon: IconLucideMessageSquarePlus,
		},
		{
			href: "changelog",
			name: "Changelog",
			icon: IconLucideBell,
		},
	];

	const checkForUpdates = async () => {
		setIsCheckingForUpdates(true);

		try {
			const update = await check();

			if (!update) {
				await dialog.message(
					"You're already using the latest version of Zensloom.",
					{
						title: "No Update Available",
						kind: "info",
					},
				);
				return;
			}

			const shouldUpdate = await dialog.confirm(
				`Version ${update.version} of Zensloom is available, would you like to install it?`,
				{ title: "Update Zensloom", okLabel: "Update", cancelLabel: "Ignore" },
			);

			if (shouldUpdate) navigate("/update");
		} catch (e) {
			console.error("Failed to check for updates:", e);
			await dialog.message(
				"Unable to check for updates. Please download the latest version manually.\n\nIf this issue persists, please contact support.",
				{ title: "Update Error", kind: "error" },
			);
		} finally {
			setIsCheckingForUpdates(false);
		}
	};

	return (
		<div class="zensloom-settings-shell flex-1 flex flex-row divide-x divide-gray-3 text-[0.875rem] leading-5 overflow-y-hidden">
			<div
				class="zensloom-settings-sidebar flex flex-col h-full bg-gray-2"
				data-tauri-drag-region
			>
				<div class="zensloom-settings-window-spacer" data-tauri-drag-region />
				<div
					class="zensloom-settings-profile flex gap-2 items-center mx-2 mt-2 mb-3 px-2 py-1.5 rounded-lg text-left"
					data-tauri-drag-region="false"
				>
					<div class="zensloom-settings-profile-icon flex justify-center items-center size-8 shrink-0 rounded-full bg-gray-3 text-gray-11">
						<IconLucideUserRound class="size-4" aria-hidden="true" />
					</div>
					<div class="zensloom-settings-profile-copy flex flex-col flex-1 gap-0.5 min-w-0">
						<p class="truncate text-[13px] text-gray-12">Zensloom</p>
						<p class="truncate text-[11px] text-gray-10">Local User</p>
					</div>
				</div>
				<ul class="zensloom-settings-nav min-w-48 h-full p-2.5 space-y-1 text-gray-12">
					<For each={settingsItems}>
						{(item) => (
							<li>
								<A
									href={item.href}
									activeClass="bg-gray-5 pointer-events-none"
									class="zensloom-settings-nav-item rounded-lg h-8 hover:bg-gray-3 text-[13px] px-2 flex flex-row items-center gap-1.5 transition-colors"
								>
									<item.icon class="opacity-60 size-4" aria-hidden="true" />
									<span>{item.name}</span>
								</A>
							</li>
						)}
					</For>
				</ul>
				<div class="zensloom-settings-account p-2.5 text-left flex flex-col">
					<Show when={version()}>
						{(v) => (
							<div class="mb-2 text-xs text-gray-11 flex flex-col items-start gap-1.5">
								<span>v{v()}</span>
								<div class="flex flex-col items-start gap-1.5">
									<button
										type="button"
										class="text-gray-11 hover:text-gray-12 underline transition-colors disabled:cursor-default disabled:opacity-50 disabled:hover:text-gray-11"
										disabled={isCheckingForUpdates()}
										onClick={checkForUpdates}
									>
										{isCheckingForUpdates()
											? "Checking..."
											: "Check for updates"}
									</button>
								</div>
							</div>
						)}
					</Show>
				</div>
			</div>
			<div class="zensloom-settings-content overflow-y-hidden flex-1 animate-in min-w-0">
				<ZensloomErrorBoundary>
					<Suspense>{props.children}</Suspense>
				</ZensloomErrorBoundary>
			</div>
		</div>
	);
}
