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
		partition(filter: (elem: T) => boolean): [T[], T[]];
		remove(item: T): void;
	}
}

/* https://stackoverflow.com/a/50636286 */
export function arrayPartition<T>(array: T[], filter: (elem: T) => boolean): [T[], T[]] {
	const pass: T[] = [],
		fail: T[] = [];
	array.forEach((e) => (filter(e) ? pass : fail).push(e));
	return [pass, fail];
}

export function arrayRemove<T>(this: T[], item: T): void {
	const index = this.indexOf(item);
	if (index > -1) {
		this.splice(index, 1);
	}
}

// register extensions
if (!Array.prototype.partition)
	Array.prototype.partition = function <T>(this: T[], filter: (elem: T) => boolean) {
		return arrayPartition(this, filter);
	};

if (!Array.prototype.remove)
	Array.prototype.remove = function <T>(this: T[], item: T) {
		return arrayRemove.call(this, item);
	};
