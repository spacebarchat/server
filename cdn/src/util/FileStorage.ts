import { Storage } from "./Storage";
import fs from "fs";
import fse from "fs-extra";
import { join, relative, dirname } from "path";
import "missing-native-js-functions";
import { Readable } from "stream";
import ExifTransformer = require("exif-be-gone");

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
		fse.ensureDirSync(dirname(path));

		value = Readable.from(value);
		const cleaned_file = fs.createWriteStream(path);

		return value.pipe(new ExifTransformer()).pipe(cleaned_file);
	}

	async delete(path: string) {
		fs.unlinkSync(getPath(path));
	}
}
