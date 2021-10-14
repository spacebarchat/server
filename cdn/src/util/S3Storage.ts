import { S3 } from "@aws-sdk/client-s3";
import { Readable, Stream } from "stream";
import { Storage } from "./Storage";

const readableToBuffer = (readable: Readable): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		readable.on('data', chunk => chunks.push(chunk));
		readable.on('error', reject);
		readable.on('end', () => resolve(Buffer.concat(chunks)));
	});

export class S3Storage implements Storage {
	public constructor(
		private client: S3,
		private basePath: string,
		private bucket: string
	) {}

	async set(path: string, data: Buffer): Promise<void> {
		await this.client.putObject({
			Bucket: this.bucket,
			Key: `${this.basePath}${path}`,
			Body: data
		});
	}

	async get(path: string): Promise<Buffer | null> {
		try {
			const s3Object = await this.client.getObject({
				Bucket: this.bucket,
				Key: `${this.basePath}${path}`
			});

			if (!s3Object.Body) return null;

			const body = s3Object.Body;

			return await readableToBuffer(<Readable> body);
		} catch(err) {
			console.error(`[CDN] Unable to get S3 object at path ${path}.`);
			console.error(err);
			return null;
		}
	}

	async delete(path: string): Promise<void> {
		await this.client.deleteObject({
			Bucket: this.bucket,
			Key: `${this.basePath}${path}`
		});
	}
}
