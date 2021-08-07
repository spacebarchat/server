import { Storage } from "./Storage";
import fs from "fs";
import { join, relative } from "path";
import "missing-native-js-functions";

function getPath(path: string) {
	if (path.indexOf("\0") !== -1 || !/^[a-z0-9]+$/.test(path)) throw new Error("invalid path");
	// STORAGE_LOCATION has a default value in start.ts
	return join(process.env.STORAGE_LOCATION || "../", path);
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
		return fs.writeFileSync(getPath(path), value, { encoding: "binary" });
	}

	async delete(path: string) {
		fs.unlinkSync(getPath(path));
	}
}
