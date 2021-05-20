import "missing-native-js-functions";
import * as Config from "./Config";

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
export function check(password: string): number {
	const passwordProperties = Config.apiConfig.get('register.password', { minLength: 8, minNumbers: 2, minUpperCase: 2, minSymbols: 0, blockInsecureCommonPasswords: false }) as Config.DefaultOptions;
	const {
		minLength,
		minNumbers,
		minUpperCase,
		minSymbols,
		blockInsecureCommonPasswords,
	} = passwordProperties.register.password;
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

	if (blockInsecureCommonPasswords) {
		if (blocklist.includes(password)) {
			strength = 0;
		}
	}
	return strength;
}
