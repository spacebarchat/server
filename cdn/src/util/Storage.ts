import { FileStorage } from "./FileStorage";

export interface Storage {
	set(path: string, data: Buffer): Promise<void>;
	get(path: string): Promise<Buffer | null>;
	delete(path: string): Promise<void>;
}

var storage: Storage;

if (process.env.STORAGE_PROVIDER === "file") {
	storage = new FileStorage();
}

export { storage };
