import "missing-native-js-functions";
import Config from "./Config";

const reNUMBER = /[0-9]/g;
const reUPPERCASELETTER = /[A-Z]/g;
const reSYMBOLS = /[A-Z,a-z,0-9]/g;

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
export function check(password: string): number {
	const { pwMinLength, pwMinNumbers, pwMinUpperCase, pwMinSymbols } = Config.get().register.password;
	var strength = 0;

	// checks for total password len
	if (password.length >= pwMinLength - 1) {
		strength += 0.25;
	}

	// checks for amount of Numbers
	if (password.count(reNUMBER) >= pwMinNumbers - 1) {
		strength += 0.25;
	}

	// checks for amount of Uppercase Letters
	if (password.count(reUPPERCASELETTER) >= pwMinUpperCase - 1) {
		strength += 0.25;
	}

	// checks for amount of symbols
	if (password.replace(reSYMBOLS, "").length >= pwMinSymbols - 1) {
		strength += 0.25;
	}

	// checks if password only consists of numbers or only consists of chars
	if (password.length == password.count(reNUMBER) || password.length === password.count(reUPPERCASELETTER)) {
		strength = 0;
	}

	return strength;
}
