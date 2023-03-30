/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { S3 } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { Storage } from "./Storage";

const readableToBuffer = (readable: Readable): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		readable.on("data", (chunk) => chunks.push(chunk));
		readable.on("error", reject);
		readable.on("end", () => resolve(Buffer.concat(chunks)));
	});

export class S3Storage implements Storage {
	public constructor(
		private client: S3,
		private bucket: string,
		private basePath?: string,
	) {}

	/**
	 * Always return a string, to ensure consistency.
	 */
	get bucketBasePath() {
		return this.basePath ?? "";
	}

	async set(path: string, data: Buffer): Promise<void> {
		await this.client.putObject({
			Bucket: this.bucket,
			Key: `${this.bucketBasePath}${path}`,
			Body: data,
		});
	}

	async get(path: string): Promise<Buffer | null> {
		try {
			const s3Object = await this.client.getObject({
				Bucket: this.bucket,
				Key: `${this.bucketBasePath ?? ""}${path}`,
			});

			if (!s3Object.Body) return null;

			const body = s3Object.Body;

			return await readableToBuffer(<Readable>body);
		} catch (err) {
			console.error(`[CDN] Unable to get S3 object at path ${path}.`);
			console.error(err);
			return null;
		}
	}

	async delete(path: string): Promise<void> {
		await this.client.deleteObject({
			Bucket: this.bucket,
			Key: `${this.bucketBasePath}${path}`,
		});
	}
}
