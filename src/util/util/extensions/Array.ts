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
		containsAll(target: T[]): boolean;
		partition(filter: (elem: T) => boolean): [T[], T[]];
		single(filter: (elem: T) => boolean): T | null;
		forEachAsync(callback: (elem: T, index: number, array: T[]) => Promise<void>): Promise<void>;
		remove(item: T): void;
		first(): T | undefined;
		last(): T | undefined;
		distinct(): T[];
		distinctBy<K>(key: (elem: T) => K): T[];
		intersect(other: T[]): T[];
		except(other: T[]): T[];
		orderBy<K>(...key: ((elem: T) => unknown)[]): T[];
		orderByDescending<K>(...key: ((elem: T) => unknown)[]): T[];
	}
}

export function arrayContainsAll<T>(arr: T[], target: T[]) {
	return target.every((v) => arr.includes(v));
}

/* https://stackoverflow.com/a/50636286 */
export function arrayPartition<T>(array: T[], filter: (elem: T) => boolean): [T[], T[]] {
	const pass: T[] = [],
		fail: T[] = [];
	array.forEach((e) => (filter(e) ? pass : fail).push(e));
	return [pass, fail];
}

export function arraySingle<T>(array: T[], filter: (elem: T) => boolean): T | null {
	const results = array.filter(filter);
	if (results.length > 1) throw new Error("Array contains more than one matching element");
	if (results.length === 0) return null;
	return results[0];
}

export async function arrayForEachAsync<T>(array: T[], callback: (elem: T, index: number, array: T[]) => Promise<void>): Promise<void> {
	await Promise.all(array.map(callback));
}

export function arrayRemove<T>(this: T[], item: T): void {
	const index = this.indexOf(item);
	if (index > -1) {
		this.splice(index, 1);
	}
}

export function arrayFirst<T>(this: T[]): T | undefined {
	return this[0];
}

export function arrayLast<T>(this: T[]): T | undefined {
	return this[this.length - 1];
}

export function arrayDistinct<T>(this: T[]): T[] {
	return Array.from(new Set(this));
}

export function arrayDistinctBy<T, K>(this: T[], key: (elem: T) => K): T[] {
	const seen = new Set<K>();
	return this.filter((item) => {
		const k = key(item);
		if (seen.has(k)) {
			return false;
		} else {
			seen.add(k);
			return true;
		}
	});
}

export function arrayIntersect<T>(this: T[], other: T[]): T[] {
	return this.filter((value) => other.includes(value));
}

export function arrayExcept<T>(this: T[], other: T[]): T[] {
	return this.filter((value) => !other.includes(value));
}

export function arrayOrderBy<T, K>(arr: T[], ...keySelectors: ((elem: T) => K)[]): T[] {
	return arr.slice().sort((a, b) => {
		for (const keySelector of keySelectors) {
			const keyA = keySelector(a);
			const keyB = keySelector(b);

			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
		}
		return 0;
	});
}

export function arrayOrderByDescending<T, K>(arr: T[], ...keySelectors: ((elem: T) => K)[]): T[] {
	return arrayOrderBy(arr, ...keySelectors).reverse();
}

// register extensions
if (!Array.prototype.containsAll)
	Array.prototype.containsAll = function <T>(this: T[], target: T[]) {
		return arrayContainsAll(this, target);
	};
if (!Array.prototype.partition)
	Array.prototype.partition = function <T>(this: T[], filter: (elem: T) => boolean) {
		return arrayPartition(this, filter);
	};
if (!Array.prototype.single)
	Array.prototype.single = function <T>(this: T[], filter: (elem: T) => boolean) {
		return arraySingle(this, filter);
	};
if (!Array.prototype.forEachAsync)
	Array.prototype.forEachAsync = function <T>(this: T[], callback: (elem: T, index: number, array: T[]) => Promise<void>) {
		return arrayForEachAsync(this, callback);
	};
if (!Array.prototype.remove)
	Array.prototype.remove = function <T>(this: T[], item: T) {
		return arrayRemove.call(this, item);
	};
if (!Array.prototype.first)
	Array.prototype.first = function <T>(this: T[]) {
		return arrayFirst.call(this);
	};
if (!Array.prototype.last)
	Array.prototype.last = function <T>(this: T[]) {
		return arrayLast.call(this);
	};
if (!Array.prototype.distinct)
	Array.prototype.distinct = function <T>(this: T[]) {
		return arrayDistinct.call(this);
	};
if (!Array.prototype.distinctBy)
	Array.prototype.distinctBy = function <T, K>(this: T[], key: (elem: T) => K) {
		return arrayDistinctBy.call(this, key as ((elem: unknown) => unknown));
	};
if (!Array.prototype.intersect)
	Array.prototype.intersect = function <T>(this: T[], other: T[]) {
		return arrayIntersect.call(this, other);
	};
if (!Array.prototype.except)
	Array.prototype.except = function <T>(this: T[], other: T[]) {
		return arrayExcept.call(this, other);
	};
if (!Array.prototype.orderBy)
	Array.prototype.orderBy = function <T, K>(this: T[], ...keySelectors: ((elem: T) => K)[]) {
		return arrayOrderBy(this, ...keySelectors);
	};
if (!Array.prototype.orderByDescending)
	Array.prototype.orderByDescending = function <T, K>(this: T[], ...keySelectors: ((elem: T) => K)[]) {
		return arrayOrderByDescending(this, ...keySelectors);
	};