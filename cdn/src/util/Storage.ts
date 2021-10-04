import { FileStorage } from "./FileStorage";
import path from "path";
import fse from "fs-extra";
import { bgCyan, black } from "chalk";
process.cwd();

export interface Storage {
	set(path: string, data: Buffer): Promise<void>;
	get(path: string): Promise<Buffer | null>;
	delete(path: string): Promise<void>;
}

var storage: Storage;

if (process.env.STORAGE_PROVIDER === "file" || !process.env.STORAGE_PROVIDER) {
	var location = process.env.STORAGE_LOCATION;
	if (location) {
		location = path.resolve(location);
	} else {
		location = path.join(process.cwd(), "files");
	}
	console.log(`[CDN] storage location: ${bgCyan(`${black(location)}`)}`);
	fse.ensureDirSync(location);
	process.env.STORAGE_LOCATION = location;

	storage = new FileStorage();
}

export { storage };
