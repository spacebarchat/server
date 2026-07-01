/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

// Discord.com sends ISO strings with +00:00 extension, not Z
// This causes issues with Python bot libs

export function JSONReplacer(this: { [key: string]: unknown }, key: string, value: unknown) {
    if (this[key] instanceof Date) {
        return (this[key] as Date).toISOString().replace("Z", "+00:00");
    }

    // erlpack encoding doesn't call json.stringify,
    // so our toJSON functions don't get called.
    // manually call it here
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (this?.[key]?.toJSON)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        this[key] = this[key].toJSON();

    return value;
}

/**
 * Walk an object tree and null out circular references in-place,
 * while preserving shared (non-circular) references.
 */
export function cleanCircularRefs<T>(data: T): T {
    const ancestors = new Set<object>();
    function walk(val: unknown): unknown {
        if (val === null || typeof val !== "object") return val;
        if (ancestors.has(val)) return null;
        ancestors.add(val);
        if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
                val[i] = walk(val[i]) as (typeof val)[number];
            }
        } else {
            for (const key of Object.keys(val as Record<string, unknown>)) {
                (val as Record<string, unknown>)[key] = walk((val as Record<string, unknown>)[key]);
            }
        }
        ancestors.delete(val);
        return val;
    }
    return walk(data) as T;
}
