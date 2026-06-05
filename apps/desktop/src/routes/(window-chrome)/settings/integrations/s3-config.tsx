// Zensloom Sharing: configure a BYO S3/R2 bucket for shareable links + embeds.
import { Button } from "@zensloom/ui-solid";
import { createResource, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import { commands } from "~/utils/tauri";
import { Section, SettingsPageContent } from "../Setting";
import { IntegrationConfigHeader } from "./config-header";

export default function S3ConfigPage() {
	const [status, { refetch }] = createResource(() => commands.getS3Config());

	const [accessKey, setAccessKey] = createSignal("");
	const [secretKey, setSecretKey] = createSignal("");
	const [region, setRegion] = createSignal("ap-south-1");
	const [bucket, setBucket] = createSignal("zensloom-shares");
	const [saving, setSaving] = createSignal(false);

	const save = async () => {
		if (!accessKey().trim() || !secretKey().trim()) {
			toast.error("Enter both the access key and secret key.");
			return;
		}
		setSaving(true);
		try {
			await commands.setS3Config(
				accessKey().trim(),
				secretKey().trim(),
				region().trim(),
				bucket().trim(),
			);
			setAccessKey("");
			setSecretKey("");
			toast.success("Sharing configured.");
			await refetch();
		} catch (e) {
			toast.error(typeof e === "string" ? e : "Failed to save S3 settings");
		} finally {
			setSaving(false);
		}
	};

	const disconnect = async () => {
		await commands.deleteS3Config();
		toast.success("Sharing disconnected.");
		await refetch();
	};

	const inputClass =
		"w-full px-3 py-2 rounded-lg bg-gray-2 border border-gray-3 text-sm text-gray-12 outline-none focus:border-gray-6";

	return (
		<div class="zensloom-settings-page flex flex-col h-full custom-scroll">
			<SettingsPageContent>
				<IntegrationConfigHeader title="Sharing (S3)" />
				<Section
					title="Shareable links & embeds"
					description="Connect an S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze, MinIO). Recordings you share are uploaded here and get a public link + embed code. Credentials are stored encrypted on this device only."
				>
					<Show
						when={status()?.configured}
						fallback={
							<div class="flex flex-col gap-3 p-4 rounded-lg border bg-gray-2 border-gray-3">
								<label class="flex flex-col gap-1">
									<span class="text-xs text-gray-10">Access Key ID</span>
									<input
										class={inputClass}
										value={accessKey()}
										onInput={(e) => setAccessKey(e.currentTarget.value)}
										placeholder="AKIA…"
										autocomplete="off"
									/>
								</label>
								<label class="flex flex-col gap-1">
									<span class="text-xs text-gray-10">Secret Access Key</span>
									<input
										type="password"
										class={inputClass}
										value={secretKey()}
										onInput={(e) => setSecretKey(e.currentTarget.value)}
										placeholder="••••••••"
										autocomplete="off"
									/>
								</label>
								<div class="flex gap-3">
									<label class="flex flex-col gap-1 flex-1">
										<span class="text-xs text-gray-10">Region</span>
										<input
											class={inputClass}
											value={region()}
											onInput={(e) => setRegion(e.currentTarget.value)}
											placeholder="ap-south-1"
										/>
									</label>
									<label class="flex flex-col gap-1 flex-1">
										<span class="text-xs text-gray-10">Bucket</span>
										<input
											class={inputClass}
											value={bucket()}
											onInput={(e) => setBucket(e.currentTarget.value)}
											placeholder="zensloom-shares"
										/>
									</label>
								</div>
								<Button variant="blue" disabled={saving()} onClick={save}>
									{saving() ? "Saving…" : "Save & connect"}
								</Button>
							</div>
						}
					>
						<div class="flex items-center justify-between p-4 rounded-lg border bg-gray-2 border-gray-3">
							<div class="flex flex-col">
								<span class="text-sm text-gray-12">
									Connected to <b>{status()?.bucket}</b>
								</span>
								<span class="text-xs text-gray-10">
									Region {status()?.region}
								</span>
							</div>
							<Button variant="gray" onClick={disconnect}>
								Disconnect
							</Button>
						</div>
					</Show>
				</Section>
			</SettingsPageContent>
		</div>
	);
}
