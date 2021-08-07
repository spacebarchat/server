import { Storage } from "./Storage";
import fs from "fs";
import { join, relative } from "path";
import "missing-native-js-functions";

function getPath(path: string) {
	// STORAGE_LOCATION has a default value in start.ts
	const root = process.env.STORAGE_LOCATION || "../";
	var filename = join(root, path);

	if (path.indexOf("\0") !== -1 || !filename.startsWith(root)) throw new Error("invalid path");
	return filename;
}

export class FileStorage implements Storage {
	async get(path: string): Promise<Buffer | null> {
		try {
			return fs.readFileSync(getPath(path));
		} catch (error) {
			return null;
		}
	}

	async set(path: string, value: any) {
		path = getPath(path);
		const dir = path.split("/").slice(0, -1).join("/");
		fs.mkdirSync(dir, { recursive: true });

		return fs.writeFileSync(path, value, { encoding: "binary" });
	}

	async delete(path: string) {
		fs.unlinkSync(getPath(path));
	}
}
