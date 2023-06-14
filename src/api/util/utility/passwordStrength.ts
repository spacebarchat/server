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

function calculateEntropy(str: string) {
	// TODO: calculate the shannon entropy
	return 0;
}

export function checkPassword(password: string): number {
	let strength = 0;

	// checks for total password len
	if (password.length >= 7) strength += 0.2;

	// checks for numbers
	const numbers = password.match(reNUMBER);
	if (numbers) strength += 0.2;

	// checks for uppercase Letters
	const uppercase = password.match(reUPPER);
	if (uppercase) strength += 0.3;

	// checks for symbols
	const symbols = password.match(reSYMBOLS);
	if (symbols) strength += 0.3;

	// checks if password only consists of numbers or only consists of chars
	if (numbers && uppercase) {
		if (
			password.length == numbers.length ||
			password.length === uppercase.length
		) {
			strength = 0;
		}
	}

	/*
   * this seems to be broken
   *
	const entropyMap: { [key: string]: number } = {};
	for (let i = 0; i < password.length; i++) {
		if (entropyMap[password[i]]) entropyMap[password[i]]++;
		else entropyMap[password[i]] = 1;
	}

	const entropies = Object.values(entropyMap);

	entropies.map((x) => x / entropyMap.length);
	strength +=
		entropies.reduceRight((a: number, x: number) => a - x * Math.log2(x)) /
		Math.log2(password.length);
  */

  strength += calculateEntropy(password)
	return strength;
}
