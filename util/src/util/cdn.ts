import FormData from "form-data";
import { HTTPError } from "lambert-server";
import fetch from "node-fetch";
import { Config } from "./Config";
import multer from "multer";

export async function uploadFile(path: string, file?: Express.Multer.File) {
	if (!file?.buffer) throw new HTTPError("Missing file in body");

	const form = new FormData();
	form.append("file", file.buffer, {
		contentType: file.mimetype,
		filename: file.originalname,
	});

	const response = await fetch(`${Config.get().cdn.endpointPrivate || "http://localhost:3003"}${path}`, {
		headers: {
			signature: Config.get().security.requestSignature,
			...form.getHeaders(),
		},
		method: "POST",
		body: form,
	});
	const result = await response.json();

	if (response.status !== 200) throw result;
	return result;
}

export async function handleFile(path: string, body?: string): Promise<string | undefined> {
	if (!body || !body.startsWith("data:")) return undefined;
	try {
		const mimetype = body.split(":")[1].split(";")[0];
		const buffer = Buffer.from(body.split(",")[1], "base64");

		// @ts-ignore
		const { id } = await uploadFile(path, { buffer, mimetype, originalname: "banner" });
		return id;
	} catch (error) {
		console.error(error);
		throw new HTTPError("Invalid " + path);
	}
}

export async function deleteFile(path: string) {
	const response = await fetch(`${Config.get().cdn.endpointPrivate || "http://localhost:3003"}${path}`, {
		headers: {
			signature: Config.get().security.requestSignature,
		},
		method: "DELETE",
	});
	const result = await response.json();

	if (response.status !== 200) throw result;
	return result;
}
