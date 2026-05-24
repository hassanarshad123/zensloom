// Zensloom v1.0: No telemetry, no analytics. Privacy is a promise.
// These are no-op stubs so callers don't need to change.

export function initAnonymousUser(): void {
	// no-op: telemetry removed in v1.0
}

export function identifyUser(
	_userId: string,
	_properties?: Record<string, unknown>,
): void {
	// no-op: telemetry removed in v1.0
}

export function trackEvent(
	_eventName: string,
	_properties?: Record<string, unknown>,
): void {
	// no-op: telemetry removed in v1.0
}
