import fs from "fs/promises";
import "missing-native-js-functions";

export interface traverseDirectoryOptions {
	dirname: string;
	filter?: RegExp;
	excludeDirs?: RegExp;
	recursive?: boolean;
}

const DEFAULT_EXCLUDE_DIR = /^\./;
const DEFAULT_FILTER = /^([^\.].*)\.js$/;

export async function traverseDirectory<T>(
	options: traverseDirectoryOptions,
	action: (path: string) => T
): Promise<T[]> {
	if (!options.filter) options.filter = DEFAULT_FILTER;
	if (!options.excludeDirs) options.excludeDirs = DEFAULT_EXCLUDE_DIR;

	const routes = await fs.readdir(options.dirname);
	const promises = <Promise<T | T[] | undefined>[]>routes.map(async (file) => {
		const path = options.dirname + file;
		const stat = await fs.lstat(path);
		if (path.match(<RegExp>options.excludeDirs)) return;

		if (stat.isFile() && path.match(<RegExp>options.filter)) {
			return action(path);
		} else if (options.recursive && stat.isDirectory()) {
			return traverseDirectory({ ...options, dirname: path + "/" }, action);
		}
	});
	const result = await Promise.all(promises);

	const t = <(T | undefined)[]>result.flat();

	return <T[]>t.filter((x) => x != undefined);
}
