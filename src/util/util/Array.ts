/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

export function containsAll(arr: any[], target: any[]) {
	return target.every((v) => arr.includes(v));
}

// Rory - 20/01/2023 - Add utility functions to aid with identification of file types in emojis
export function arrayBufferMatchesArr(
	haystack: Uint8Array,
	needle: number[],
	offset: number,
) {
	return arrayBufferMatches(haystack, new Uint8Array(needle), 0);
}

export function arrayBufferMatches(
	haystack: Uint8Array,
	needle: Uint8Array,
	offset: number,
) {
	for (let i = 0; i < needle.length; i++) {
		if (haystack[i + offset] !== needle[i]) return false;
	}
	return true;
}
