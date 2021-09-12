import { Config } from "@fosscord/util";
import "missing-native-js-functions";

const reNUMBER = /[0-9]/g;
const reUPPERCASELETTER = /[A-Z]/g;
const reSYMBOLS = /[A-Z,a-z,0-9]/g;

const blocklist: string[] = []; // TODO: update ones passwordblocklist is stored in db
/*
 * https://en.wikipedia.org/wiki/Password_policy
 * password must meet following criteria, to be perfect:
 *  - min <n> chars
 *  - min <n> numbers
 *  - min <n> symbols
 *  - min <n> uppercase chars
 *
 * Returns: 0 > pw > 1
 */
export function checkPassword(password: string): number {
	const { minLength, minNumbers, minUpperCase, minSymbols } = Config.get().register.password;
	var strength = 0;

	// checks for total password len
	if (password.length >= minLength - 1) {
		strength += 0.25;
	}

	// checks for amount of Numbers
	if (password.count(reNUMBER) >= minNumbers - 1) {
		strength += 0.25;
	}

	// checks for amount of Uppercase Letters
	if (password.count(reUPPERCASELETTER) >= minUpperCase - 1) {
		strength += 0.25;
	}

	// checks for amount of symbols
	if (password.replace(reSYMBOLS, "").length >= minSymbols - 1) {
		strength += 0.25;
	}

	// checks if password only consists of numbers or only consists of chars
	if (password.length == password.count(reNUMBER) || password.length === password.count(reUPPERCASELETTER)) {
		strength = 0;
	}

	return strength;
}
