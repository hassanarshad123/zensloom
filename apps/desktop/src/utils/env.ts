// Zensloom v1.0: Local-only. These point at the project's GitHub presence and
// are only used for the optional manual "check for updates" / help links.
export const ZENSLOOM_REPO_URL = "https://github.com/zensbot/zensloom";
export const ZENSLOOM_RELEASES_URL =
	"https://github.com/zensbot/zensloom/releases";
export const ZENSLOOM_ISSUES_URL = "https://github.com/zensbot/zensloom/issues";

export const clientEnv = {
	VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL ?? ZENSLOOM_REPO_URL,
};
