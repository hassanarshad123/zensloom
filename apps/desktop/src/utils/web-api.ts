// Zensloom v1.0: Local-only. Cloud API clients removed.
// These stubs export the same names so callers compile without changes.
// Every method returns a rejected promise or a safe default.

import { authStore } from "~/store";

const notImplemented = () =>
	Promise.reject(
		new Error("Cloud features are not available in Zensloom v1.0"),
	);

/**
 * A no-op proxy that returns a function throwing "not available" for any
 * property access chain (e.g. apiClient.desktop.getChangelogPosts(...)).
 */
// biome-ignore lint/suspicious/noExplicitAny: Proxy stub requires flexible typing
function createStubClient(): Record<string, any> {
	const handler: ProxyHandler<object> = {
		get(_target, _prop) {
			return new Proxy(() => notImplemented(), handler);
		},
	};
	return new Proxy({}, handler);
}

export const apiClient = createStubClient();
export const licenseApiClient = createStubClient();
export const orgCustomDomainClient = createStubClient();

export async function maybeProtectedHeaders(): Promise<{
	authorization: string | undefined;
}> {
	const store = await authStore.get();

	let token: string | undefined;
	if (store?.secret && typeof store.secret === "object") {
		const secret = store.secret as Record<string, unknown>;
		if ("api_key" in secret && typeof secret.api_key === "string") {
			token = secret.api_key;
		} else if ("token" in secret && typeof secret.token === "string") {
			token = secret.token;
		}
	}

	return { authorization: token ? `Bearer ${token}` : undefined };
}

export async function protectedHeaders(): Promise<{
	authorization: string;
}> {
	const { authorization } = await maybeProtectedHeaders();
	if (!authorization) {
		throw new Error(
			"Not signed in. Cloud features are not available in Zensloom v1.0.",
		);
	}
	return { authorization };
}
