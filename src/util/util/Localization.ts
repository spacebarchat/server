/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

export function getLocalizedValue(locale?: string, localizations?: Record<string, string>, fallback?: string): string {
    if (!localizations) {
        if (fallback) return fallback;
        throw new Error("getLocalizedValue: neither localizations nor flalback were provided!");
    }
    if (!locale) {
        if (fallback) return fallback;
        if ("en-US" in localizations) return localizations["en-US"];
        if ("en-GB" in localizations) return localizations["en-GB"];
        throw new Error("getLocalizedValue: no target locale was provided, and the localizations neither had en-US nor en-GB!");
    }

    if (locale in localizations) return localizations[locale!];
    return getLocalizedValue(undefined, localizations, undefined); // too lazy to duplicate code
}
