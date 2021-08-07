import { Storage } from "./Storage";
import fs from "fs";
import { join, relative } from "path";
import "missing-native-js-functions";

function getPath(path: string) {
	// STORAGE_LOCATION has a default value in start.ts
	return join(process.env.STORAGE_LOCATION || "../", relative("/", path));
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
		path = join(process.env.STORAGE_LOCATION || "", path);
		fs.unlinkSync(path);
	}
}
