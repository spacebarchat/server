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

declare global {
	interface Array<T> {
		/**
		 * @deprecated never use, idk why but I can't get rid of this without errors
		 */
		remove(h: T): never;
	}
}
/* https://stackoverflow.com/a/50636286 */
export function arrayPartition<T>(array: T[], filter: (elem: T) => boolean): [T[], T[]] {
	const pass: T[] = [],
		fail: T[] = [];
	array.forEach((e) => (filter(e) ? pass : fail).push(e));
	return [pass, fail];
}

export function arrayRemove<T>(array: T[], item: T): void {
	const index = array.indexOf(item);
	if (index > -1) {
		array.splice(index, 1);
	}
}

export type Comparable = number | string | bigint | Date | { valueOf(): number | string | bigint };

export function arrayOrderBy<T>(array: T[], keySelector: (elem: T) => Comparable): T[] {
	return array.slice().sort((a, b) => {
		const keyA = keySelector(a);
		const keyB = keySelector(b);

		if (keyA < keyB) return -1;
		if (keyA > keyB) return 1;
		return 0;
	});
}

export function arrayOrderByDescending<T>(array: T[], keySelector: (elem: T) => Comparable): T[] {
	return array.slice().sort((a, b) => {
		const keyA = keySelector(a);
		const keyB = keySelector(b);

		if (keyA > keyB) return -1;
		if (keyA < keyB) return 1;
		return 0;
	});
}
