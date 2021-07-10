import { Storage } from "./Storage";
import fs from "fs";
import { join } from "path";
import "missing-native-js-functions";

export class FileStorage implements Storage {
	async get(path: string): Promise<Buffer | null> {
		path = join(process.env.STORAGE_LOCATION || "", path);
		try {
			const file = fs.readFileSync(path);
			// @ts-ignore
			return file;
		} catch (error) {
			return null;
		}
	}

	async set(path: string, value: any) {
		path = join(process.env.STORAGE_LOCATION || "", path).replace(/[\\]/g, "/");
		const dir = path.split("/").slice(0, -1).join("/");
		fs.mkdirSync(dir, { recursive: true });

		return fs.writeFileSync(path, value, { encoding: "binary" });
	}

	async delete(path: string) {
		path = join(process.env.STORAGE_LOCATION || "", path);
		fs.unlinkSync(path);
	}
}
