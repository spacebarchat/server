/**
 * Normalize a URL by:
 * - Removing trailing slashes (except root path)
 * - Sorting query params alphabetically
 * - Removing empty query strings
 * - Removing fragments
 */
export function normalizeUrl(input: string): string {
	try {
		const u = new URL(input);
		// Remove fragment
		u.hash = "";
		// Normalize pathname - remove trailing slash except for root "/"
		if (u.pathname !== "/" && u.pathname.endsWith("/")) {
			u.pathname = u.pathname.slice(0, -1);
		}
		// Normalize query params: sort by key
		if (u.search) {
			const params = Array.from(u.searchParams.entries());
			params.sort(([a], [b]) => a.localeCompare(b));
			u.search = params.length
				? "?" + params.map(([k, v]) => `${k}=${v}`).join("&")
				: "";
		} else {
			// Ensure no empty search string
			u.search = "";
		}
		return u.toString();
	} catch (e) {
		return input;
	}
}
