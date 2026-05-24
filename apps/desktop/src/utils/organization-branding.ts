// Zensloom v1.0: Local-only. Organization branding stubbed to return defaults.
// All exported names are preserved so downstream files compile.

import { createMemo, createSignal } from "solid-js";
import { authStore, recordingSettingsStore } from "~/store";

export interface OrganizationBrandColors {
	primary: string | null;
	secondary: string | null;
	accent: string | null;
	background: string | null;
}

export interface OrganizationBrandingPatchBody {
	name?: string;
	brandColors?: Partial<OrganizationBrandColors>;
	iconBase64?: string | null;
	iconContentType?: string | null;
	logo?:
		| { action: "upload"; contentType: string; data: string }
		| { action: "remove" }
		| { action: "keep" }
		| null;
}

export interface DesktopOrganization {
	id: string;
	name: string;
	ownerId: string;
	role: "owner" | "member";
	canEditBrand: boolean;
	iconUrl: string | null;
	brandColors: OrganizationBrandColors;
}

export type OrganizationAvailability =
	| "signed-out"
	| "loading"
	| "available"
	| "unavailable";

export const EMPTY_ORGANIZATION_BRAND_COLORS: OrganizationBrandColors = {
	primary: null,
	secondary: null,
	accent: null,
	background: null,
};

export const ORGANIZATION_BRAND_COLOR_LABELS: Record<
	keyof OrganizationBrandColors,
	string
> = {
	primary: "Primary",
	secondary: "Secondary",
	accent: "Accent",
	background: "Background",
};

export const ORGANIZATION_BRAND_COLOR_KEYS = [
	"primary",
	"secondary",
	"accent",
	"background",
] as const;

export type OrganizationBrandColorKey =
	(typeof ORGANIZATION_BRAND_COLOR_KEYS)[number];

export type OrganizationBrandColorSwatch = {
	key: OrganizationBrandColorKey;
	label: string;
	color: string;
};

export const ORGANIZATION_BRAND_COLOR_DEFAULTS: Record<
	keyof OrganizationBrandColors,
	string
> = {
	primary: "#4785FF",
	secondary: "#FFFFFF",
	accent: "#FF4766",
	background: "#000000",
};

export const ORGANIZATION_LOGO_MAX_BYTES = 1024 * 1024;

export const ORGANIZATION_LOGO_CONTENT_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"image/avif",
] as const;

export type CachedAuthStore = {
	secret?: unknown;
	user_id?: string | null;
	organizations?: unknown[];
	organizations_updated_at?: number | null;
};

export function normalizeDesktopOrganization(
	_value: unknown,
): DesktopOrganization | null {
	return null;
}

export function getSelectedOrganizationId(
	organizations: DesktopOrganization[],
	storedId?: string | null,
): string | null {
	if (storedId) return storedId;
	return organizations[0]?.id ?? null;
}

export function getOrganizationBrandColorSwatches(
	_organization: DesktopOrganization | null | undefined,
): OrganizationBrandColorSwatch[] {
	return [];
}

export function hasAvailableOrganizationCache(
	_auth: CachedAuthStore | null | undefined,
	_now?: number,
): boolean {
	return false;
}

export function createDesktopOrganizationsQuery() {
	const auth = authStore.createQuery();
	const [refreshing] = createSignal(false);

	return {
		auth,
		availability: () => "signed-out" as OrganizationAvailability,
		hasLocalAuth: () => false,
		organizations: () => [] as DesktopOrganization[],
		refresh: async () => {},
		refreshing,
		signedIn: () => false,
	};
}

export function createSelectedOrganization() {
	const organizationQuery = createDesktopOrganizationsQuery();
	const settings = recordingSettingsStore.createQuery();

	const selectedOrganizationId = createMemo(() =>
		getSelectedOrganizationId(
			organizationQuery.organizations(),
			settings.data?.organizationId ?? null,
		),
	);

	const selectedOrganization = createMemo(
		() => null as DesktopOrganization | null,
	);

	const setSelectedOrganizationId = async (
		_organizationId: string | null,
	) => {};

	return {
		...organizationQuery,
		settings,
		selectedOrganization,
		selectedOrganizationId,
		setSelectedOrganizationId,
	};
}

export async function encodeFileAsBase64(file: File): Promise<string> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const chunkSize = 0x8000;
	const chunks: string[] = [];

	for (let index = 0; index < bytes.length; index += chunkSize) {
		chunks.push(
			String.fromCharCode(...bytes.subarray(index, index + chunkSize)),
		);
	}

	return btoa(chunks.join(""));
}

export async function updateOrganizationBranding(
	_organizationId: string,
	_body: OrganizationBrandingPatchBody,
): Promise<DesktopOrganization> {
	throw new Error(
		"Organization branding is not available in Zensloom v1.0 (local-only).",
	);
}
