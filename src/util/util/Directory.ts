import fs from "fs";
import path from "path";

export function getDirs(dir: string) {
	return fs.readdirSync(dir).filter((x) => {
		try {
			fs.readdirSync(path.join(dir, x));
			return true;
		} catch (e) {
			return false;
		}
	});
}

export function walk(dir: string) {
	let results: string[] = [];
	let list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		let stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else {
			results.push(file);
		}
	});
	return results;
}