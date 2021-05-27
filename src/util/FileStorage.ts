import { Storage } from "./Storage";
import fs from "fs/promises";
import { join } from "path";

export class FileStorage implements Storage {
	async get(path: string) {
		return fs.readFile(join(process.env.STORAGE_LOCATION || "", path), { encoding: "binary" });
	}

	async set(path: string, value: any) {
		return fs.writeFile(join(process.env.STORAGE_LOCATION || "", path), value, { encoding: "binary" });
	}
}
