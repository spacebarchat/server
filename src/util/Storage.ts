import { FileStorage } from "./FileStorage";

export interface Storage {
	set(hash: string, data: any, prefix?: string): Promise<void>;
	get(hash: string, prefix?: string): Promise<any>;
}

var storage: Storage;

if (process.env.STORAGE_PROVIDER === "file") {
	storage = new FileStorage();
}

export { storage };
