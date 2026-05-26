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

export function arrayDistinctBy<T, M>(array: T[], selector: (elem: T) => M): T[] {
    const mapped = new Set<M>();

    return array.filter((item) => {
        const mappedValue = selector(item);
        if (mapped.has(mappedValue)) return false;

        mapped.add(mappedValue);
        return true;
    });
}

export function arrayGroupBy<T, M>(array: T[], selector: (elem: T) => M): Map<M, T[]> {
    const map = new Map<M, T[]>();

    array.forEach((item) => {
        const mappedValue = selector(item);
        const existing = map.get(mappedValue);
        if (existing) existing.push(item);
        else map.set(mappedValue, [item]);
    });

    return map;
}

// https://github.com/TheArcaneBrony/ArcaneLibs/blob/ca7ce2bb57a5dffd891b0b86ec5f358df02735c0/ArcaneLibs/Extensions/CollectionExtensions.cs#L103
export function arrayDistributeSequentially<T>(array: T[], count: number): T[][] {
    if (count <= 0) throw new Error("Count must be greater than 0");
    if (count == 1) return [array];

    const list = array;
    const groups: T[][] = [];
    for (let i = 0; i < count; i++) groups.push([]);

    // [1,2,3],[4,5,6],[7,8,9]...
    for (let i = 0; i < list.length; i++) {
        const idx: number = Math.floor((i / list.length) * count);
        // console.log(`${i}/${list.length} -> ${idx}:${groups[idx].length}/{count}`);
        groups[idx].push(list[i]);
    }

    return groups;
}

//region Numerics
export function arraySum(array: number[]) {
    return array.reduce((prev, curr) => prev + curr, 0);
}
//endregion
