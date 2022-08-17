import fs from "fs";
import path, { dirname, join } from "path";
import { Readable } from "stream";
import { Storage } from "./Storage";
//import ExifTransformer = require("exif-be-gone");
import ExifTransformer from "exif-be-gone";

// TODO: split stored files into separate folders named after cloned route

function getPath(filePath: string) {
	// STORAGE_LOCATION has a default value in start.ts
	const root = process.env.STORAGE_LOCATION || "../";
	let filename = join(root, filePath);

	if (filePath.indexOf("\0") !== -1 || !filename.startsWith(root)) throw new Error("invalid path");
	return filename;
}

export class FileStorage implements Storage {
	async get(filePath: string): Promise<Buffer | null> {
		filePath = getPath(filePath);
		try {
			return fs.readFileSync(filePath);
		} catch (error) {
			try {
				const files = fs.readdirSync(filePath);
				if (!files.length) return null;
				return fs.readFileSync(join(filePath, files[0]));
			} catch (error) {
				return null;
			}
		}
	}

	async set(filePath: string, value: any) {
		filePath = getPath(filePath);
		//fse.ensureDirSync(dirname(path));
		fs.mkdirSync(dirname(filePath), { recursive: true });

		value = Readable.from(value);
		const cleaned_file = fs.createWriteStream(filePath);

		return value.pipe(new ExifTransformer()).pipe(cleaned_file);
	}

	async delete(filePath: string) {
		//TODO: (done?) we should delete the parent directory if empty
		fs.unlinkSync(getPath(filePath));
		if (fs.readdirSync(path.dirname(filePath)).length == 0) {
			fs.rmSync(path.dirname(filePath));
		}
	}
}
