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

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+";

// binary to string lookup table
const b2s = alphabet.split("");

// string to binary lookup table
// 123 == 'z'.charCodeAt(0) + 1
const s2b = new Array(123);
for (let i = 0; i < alphabet.length; i++) {
    s2b[alphabet.charCodeAt(i)] = i;
}

// number to base64
export const ntob = (n: number): string => {
    if (n < 0) return `-${ntob(-n)}`;

    let lo = n >>> 0;
    let hi = (n / 4294967296) >>> 0;

    let right = "";
    while (hi > 0) {
        right = b2s[0x3f & lo] + right;
        lo >>>= 6;
        lo |= (0x3f & hi) << 26;
        hi >>>= 6;
    }

    let left = "";
    do {
        left = b2s[0x3f & lo] + left;
        lo >>>= 6;
    } while (lo > 0);

    return left + right;
};

// base64 to number
export const bton = (base64: string) => {
    let number = 0;
    const sign = base64.charAt(0) === "-" ? 1 : 0;

    for (let i = sign; i < base64.length; i++) {
        number = number * 64 + s2b[base64.charCodeAt(i)];
    }

    return sign ? -number : number;
};
