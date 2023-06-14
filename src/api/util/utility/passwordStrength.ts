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

import { Config } from "@spacebar/util";
import "missing-native-js-functions";

const reNUMBER = /[0-9]/g;
const reUPPER = /[A-Z]/g;
const reSYMBOLS = /[^a-zA-Z0-9\s]/g;

// const blocklist: string[] = []; // TODO: update ones passwordblocklist is stored in db
/*
 * https://en.wikipedia.org/wiki/Password_policy
 * password must meet following criteria, to be perfect:
 *  - min <n> chars
 *  - min <n> numbers
 *  - min <n> symbols
 *  - min <n> uppercase chars
 *  - shannon entropy folded into [0, 1) interval
 *
 * Returns: 0 > pw > 1
 */
export function checkPassword(password: string): number {
	const { strength } = Config.get().register.password;

	let pwStrength = 0;

	// checks for total password len
	if (password.length >= 7) {
		pwStrength += 0.05;
	}

	// checks for amount of Numbers
	const numbers = password.match(reNUMBER);
	if (numbers && numbers.length >= 1) {
		pwStrength += 0.05;
	}

	// checks for amount of Uppercase Letters
	const uppercase = password.match(reUPPER);
	if (uppercase && uppercase.length >= 1) {
		pwStrength += 0.05;
	}

	// checks for amount of symbols
	const symbols = password.match(reSYMBOLS);
	if (symbols && symbols.length >= 1) {
		pwStrength += 0.05;
	}

	// checks if password only consists of numbers or only consists of chars
	if (numbers && uppercase) {
		if (
			password.length == numbers.length ||
			password.length === uppercase.length
		) {
			pwStrength = 0;
		}
	}

	const entropyMap: { [key: string]: number } = {};
	for (let i = 0; i < password.length; i++) {
		if (entropyMap[password[i]]) entropyMap[password[i]]++;
		else entropyMap[password[i]] = 1;
	}

	const entropies = Object.values(entropyMap);

	entropies.map((x) => x / entropyMap.length);
	pwStrength +=
		entropies.reduceRight((a: number, x: number) => a - x * Math.log2(x)) /
		Math.log2(password.length);
	return pwStrength;
}
