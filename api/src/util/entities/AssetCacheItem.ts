import { Headers } from "node-fetch";

export class AssetCacheItem {
	public Key: string;
	public FilePath: string;
	public Headers: any;

	constructor(key: string){
		this.Key = key;
	}
	/*constructor(key: string, filePath: string, headers: Headers) {
		this.Key = key;
		this.FilePath = filePath;
		this.Headers = headers;
	}*/
}