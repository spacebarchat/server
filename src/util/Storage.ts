import { FileStorage } from "./FileStorage";

export interface Storage {
	set(path: string, data: any): Promise<void>;
	get(path: string): Promise<any>;
}

var storage: Storage;

if (process.env.STORAGE_PROVIDER === "file") {
	storage = new FileStorage();
}

export { storage };
