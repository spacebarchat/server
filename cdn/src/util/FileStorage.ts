import { Storage } from "./Storage";
import fs from "fs";
import fse from "fs-extra";
import { join, relative, dirname } from "path";
import "missing-native-js-functions";
import { Readable } from "stream";
import ExifTransformer = require("exif-be-gone");

// TODO: split stored files into separate folders named after cloned route

function getPath(path: string) {
	// STORAGE_LOCATION has a default value in start.ts
	const root = process.env.STORAGE_LOCATION || "../";
	var filename = join(root, path);

	if (path.indexOf("\0") !== -1 || !filename.startsWith(root))
		throw new Error("invalid path");
	return filename;
}

export class FileStorage implements Storage {
	async get(path: string): Promise<Buffer | null> {
		path = getPath(path);
		try {
			return fs.readFileSync(path);
		} catch (error) {
			try {
				const files = fs.readdirSync(path);
				if (!files.length) return null;
				return fs.readFileSync(join(path, files[0]));
			} catch (error) {
				return null;
			}
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
		//TODO we should delete the parent directory if empty
		fs.unlinkSync(getPath(path));
	}
}
