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

// Inspired by dotnet: https://learn.microsoft.com/en-us/dotnet/api/system.random?view=net-9.0#methods
export class Random {
    public static nextInt(min?: number, max?: number): number {
        if (min === undefined && max === undefined) {
            // Next()
            return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        } else if (max === undefined) {
            // Next(Int32)
            if (min! <= 0) throw new RangeError("min must be greater than 0");
            return Math.floor(Math.random() * min!);
        } else {
            // Next(Int32, Int32)
            if (min! >= max!) throw new RangeError("min must be less than max");
            return Math.floor(Math.random() * (max! - min!)) + min!;
        }
    }

    public static nextDouble(min?: number, max?: number): number {
        if (min === undefined && max === undefined) {
            // NextDouble()
            return Math.random();
        } else if (max === undefined) {
            // NextDouble(Double)
            if (min! <= 0) throw new RangeError("min must be greater than 0");
            return Math.random() * min!;
        } else {
            // NextDouble(Double, Double)
            if (min! >= max!) throw new RangeError("min must be less than max");
            return Math.random() * (max! - min!) + min!;
        }
    }

    public static nextBytes(count: number): Uint8Array {
        if (count <= 0) throw new RangeError("count must be greater than 0");
        const arr = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    }

    public static nextBytesArray(count: number) {
        if (count <= 0) throw new RangeError("count must be greater than 0");
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(Math.floor(Math.random() * 256));
        }
        return arr;
    }

    public static getItems<T>(items: T[], count: number): T[] {
        if (count <= 0) throw new RangeError("count must be greater than 0");
        if (count >= items.length) return this.shuffle(items);
        const usedIndices = new Set<number>();
        const result: T[] = [];
        while (result.length < count && usedIndices.size < items.length) {
            const index = Math.floor(Math.random() * items.length);
            if (!usedIndices.has(index)) {
                usedIndices.add(index);
                result.push(items[index]);
            }
        }
        return result;
    }

    public static shuffle<T>(items: T[]): T[] {
        const array = [...items];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    public static getString(choices: string, length: number) {
        const _choices = choices.split("");
        const result = new Array(length);
        for (const i in result) {
            result[i] = _choices[Random.nextInt(0, _choices.length)];
        }

        return result.join("");
    }

    public static getHexString(length: number) {
        return this.getString("0123456789ABCDEF", length);
    }
}
