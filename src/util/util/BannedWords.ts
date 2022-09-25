import fs from "fs/promises";
import path from "path";

var words: string[];

export const BannedWords = {
	init: async function init() {
		if (words) return words;
		const file = (await fs.readFile(path.join(process.cwd(), "bannedWords"))).toString();
		if (!file) {
			words = [];
			return [];
		}
		words = file.trim().split("\n");
		return words;
	},

	get: () => words,

	find: (val: string) => {
		return words.some(x => val.indexOf(x) != -1);
	}
};