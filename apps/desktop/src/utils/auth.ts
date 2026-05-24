// Zensloom v1.0: Local-only. Cloud sign-in stubbed.
// The mutation still exists so SignInButton and other callers compile.

import { createMutation } from "@tanstack/solid-query";

export function createSignInMutation() {
	return createMutation(() => ({
		mutationFn: async (_abort: AbortController) => {
			throw new Error(
				"Sign-in is not available in Zensloom v1.0. This is a local-only release.",
			);
		},
	}));
}
