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

const reNUMBER = /[0-9]/g;
const reUPPERCASELETTER = /[A-Z]/g;
const reSYMBOLS = /[A-Za-z0-9]/g;

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
	const { minLength, minNumbers, minUpperCase, minSymbols } =
		Config.get().register.password;
	let strength = 0;

	// checks for total password len
	if (password.length >= minLength - 1) {
		strength += 0.05;
	}

	// checks for amount of Numbers
	if (password.match(reNUMBER)?.length ?? 0 >= minNumbers - 1) {
		strength += 0.05;
	}

	// checks for amount of Uppercase Letters
	if (password.match(reUPPERCASELETTER)?.length ?? 0 >= minUpperCase - 1) {
		strength += 0.05;
	}

	// checks for amount of symbols
	if (password.replace(reSYMBOLS, "").length >= minSymbols - 1) {
		strength += 0.05;
	}

	// checks if password only consists of numbers or only consists of chars
	if (
		password.length == password.match(reNUMBER)?.length ||
		password.length === password.match(reUPPERCASELETTER)?.length
	) {
		strength = 0;
	}

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
	return strength;
}
