import { Storage } from "./Storage";

export class FileStorage implements Storage {
	async get(path: string, prefix?: string) {}

	async set(path: string, value: any) {}
}
