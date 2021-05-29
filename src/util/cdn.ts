import { Config } from "@fosscord/server-util";
import FormData from "form-data";
import fetch from "node-fetch";

export async function uploadFile(path: string, file: Express.Multer.File) {
	const form = new FormData();
	form.append("file", file.buffer, {
		contentType: file.mimetype,
		filename: file.originalname
	});

	const response = await fetch(`${Config.get().cdn.endpoint || "http://localhost:3003"}${path}`, {
		headers: {
			signature: Config.get().security.requestSignature,
			...form.getHeaders()
		},
		method: "POST",
		body: form
	});
	const result = await response.json();

	if (response.status !== 200) throw result;
	return result;
}
