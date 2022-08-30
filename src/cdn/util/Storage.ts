import path from "path";
import { FileStorage } from "./FileStorage";
//import fse from "fs-extra";
import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import { bgCyan, black } from "picocolors";
import { S3Storage } from "./S3Storage";
import { Paths } from "@fosscord/util";
process.cwd();

export interface Storage {
	set(path: string, data: Buffer): Promise<void>;
	get(path: string): Promise<Buffer | null>;
	delete(path: string): Promise<void>;
}

let storage: Storage;

if (process.env.STORAGE_PROVIDER === "file" || !process.env.STORAGE_PROVIDER) {
	let location = Paths.CDNFilePath;
	console.log(`[CDN] storage location: ${bgCyan(`${black(location)}`)}`);
	//fse.ensureDirSync(location);
	fs.mkdirSync(location, { recursive: true });
	process.env.STORAGE_LOCATION = location;

	storage = new FileStorage();
} else if (process.env.STORAGE_PROVIDER === "s3") {
	const region = process.env.STORAGE_REGION,
		bucket = process.env.STORAGE_BUCKET;

	if (!region) {
		console.error(`[CDN] You must provide a region when using the S3 storage provider.`);
		process.exit(1);
	}

	if (!bucket) {
		console.error(`[CDN] You must provide a bucket when using the S3 storage provider.`);
		process.exit(1);
	}

	// in the S3 provider, this should be the root path in the bucket
	let location = process.env.STORAGE_LOCATION;

	if (!location) {
		console.warn(`[CDN] STORAGE_LOCATION unconfigured for S3 provider, defaulting to the bucket root...`);
		location = undefined;
	}

	const client = new S3({ region });

	storage = new S3Storage(client, bucket, location);
}

export { storage };
