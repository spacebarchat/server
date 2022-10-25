import fs from "fs/promises";
import path from "path";
import { InvisibleCharacters } from "./InvisibleCharacters";

var words: string[];

export const BannedWords = {
	init: async function init() {
		if (words) return words;
		const file = (
			await fs.readFile(path.join(process.cwd(), "bannedWords"))
		).toString();
		if (!file) {
			words = [];
			return [];
		}
		words = file.trim().split("\r").join("").split("\n");
		return words;
	},

	get: () => words,

	find: (val: string) => {
		InvisibleCharacters.forEach(x => val = val.replaceAll(x, ""));
		var normal = words.some((x) => val.indexOf(x) != -1);
		val = val.split("").reverse().join("");
		var rtlOverride = words.some((x) => val.indexOf(x) != -1);
		return normal || rtlOverride;
	},
};
