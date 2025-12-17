/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
            u.search = params.length ? "?" + params.map(([k, v]) => `${k}=${v}`).join("&") : "";
        } else {
            // Ensure no empty search string
            u.search = "";
        }
        return u.toString();
    } catch (e) {
        return input;
    }
}
