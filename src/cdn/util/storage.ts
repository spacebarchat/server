/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { FileStorage } from "./fileStorage";
import { S3Storage } from "./s3Storage";
import path from "path";
import fs from "fs";
import { red } from "picocolors";
process.cwd();

export interface Storage {
    set(path: string, data: Buffer): Promise<void>;
    clone(path: string, newPath: string): Promise<void>;
    get(path: string): Promise<Buffer | null>;
    delete(path: string): Promise<void>;
}

let storage: Storage;

if (process.env.STORAGE_PROVIDER === "file" || !process.env.STORAGE_PROVIDER) {
    let location = process.env.STORAGE_LOCATION;
    if (location) {
        location = path.resolve(location);
    } else {
        location = path.join(process.cwd(), "files");
    }
    // TODO: move this to some start func, so it doesn't run when server is imported
    // console.log(`[CDN] storage location: ${bgCyan(`${black(location)}`)}`);
    if (!fs.existsSync(location)) fs.mkdirSync(location);
    process.env.STORAGE_LOCATION = location;

    storage = new FileStorage();
} else if (process.env.STORAGE_PROVIDER === "s3") {
    try {
        require("@aws-sdk/client-s3");
    } catch (e) {
        console.error(red(`[CDN] AWS S3 SDK not installed. Please run 'npm install --no-save @aws-sdk/client-s3' to use the S3 storage provider.`));
        process.exit(1);
    }

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

    const { S3Storage } = require("S3Storage");
    storage = new S3Storage(region, bucket, location);
}

export { storage };
