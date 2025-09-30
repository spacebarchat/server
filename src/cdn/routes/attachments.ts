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

import { Config, hasValidSignature, NewUrlUserSignatureData, Snowflake, UrlSignResult } from "@spacebar/util";
import { Request, Response, Router } from "express";
import imageSize from "image-size";
import { HTTPError } from "lambert-server";
import { multer } from "../util/multer";
import { storage } from "../util/Storage";
import { CloudAttachment } from "../../util/entities/CloudAttachment";
import { fileTypeFromBuffer } from "file-type";

const router = Router({ mergeParams: true });

const SANITIZED_CONTENT_TYPE = ["text/html", "text/mhtml", "multipart/related", "application/xhtml+xml"];

router.post("/:channel_id", multer.single("file"), async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");

	if (!req.file) throw new HTTPError("file missing");

	const { buffer, mimetype, size, originalname } = req.file;
	const { channel_id } = req.params;
	const filename = originalname.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
	const id = Snowflake.generate();
	const path = `attachments/${channel_id}/${id}/${filename}`;

	const endpoint = Config.get()?.cdn.endpointPublic || "http://localhost:3001";

	await storage.set(path, buffer);
	let width;
	let height;
	if (mimetype.includes("image")) {
		const dimensions = imageSize(buffer);
		if (dimensions) {
			width = dimensions.width;
			height = dimensions.height;
		}
	}

	const finalUrl = `${endpoint}/${path}`;

	const file = {
		id,
		content_type: mimetype,
		filename: filename,
		size,
		url: finalUrl,
		path,
		width,
		height,
	};

	return res.json(file);
});

router.get("/:channel_id/:id/:filename", async (req: Request, res: Response) => {
	const { channel_id, id, filename } = req.params;
	// const { format } = req.query;

	const path = `attachments/${channel_id}/${id}/${filename}`;

	const fullUrl = (req.headers["x-forwarded-proto"] ?? req.protocol) + "://" + (req.headers["x-forwarded-host"] ?? req.hostname) + req.originalUrl;

	if (
		Config.get().security.cdnSignUrls &&
		!hasValidSignature(
			new NewUrlUserSignatureData({
				ip: req.ip,
				userAgent: req.headers["user-agent"] as string,
			}),
			UrlSignResult.fromUrl(fullUrl),
		)
	) {
		return res.status(404).send("This content is no longer available.");
	}

	const file = await storage.get(path);
	if (!file) throw new HTTPError("File not found");
	const type = await fileTypeFromBuffer(file);
	let content_type = type?.mime || "application/octet-stream";

	if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
		content_type = "application/octet-stream";
	}

	res.set("Content-Type", content_type);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});

router.delete("/:channel_id/:id/:filename", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");

	const { channel_id, id, filename } = req.params;
	const path = `attachments/${channel_id}/${id}/${filename}`;

	await storage.delete(path);

	return res.send({ success: true });
});

// "cloud attachments"
router.put("/:channel_id/:batch_id/:attachment_id/:filename", multer.single("file"), async (req: Request, res: Response) => {
	const { channel_id, batch_id, attachment_id, filename } = req.params;
	const att = await CloudAttachment.findOneOrFail({
		where: {
			uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
			channelId: channel_id,
			userAttachmentId: attachment_id,
			userFilename: filename,
		},
	});

	const maxLength = Config.get().cdn.maxAttachmentSize;

	console.log("[Cloud Upload] Uploading attachment", att.id, att.userFilename, `Max size: ${maxLength} bytes`);

	const chunks: Buffer[] = [];
	let length = 0;

	req.on("data", (chunk) => {
		console.log(`[Cloud Upload] Received chunk of size ${chunk.length} bytes`);
		chunks.push(chunk);
		length += chunk.length;
		if (length > maxLength) {
			res.status(413).send("File too large");
			req.destroy();
		}
	});
	req.on("end", async () => {
		console.log(`[Cloud Upload] Finished receiving file, total size ${length} bytes`);
		const buffer = Buffer.concat(chunks);
		const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;

		await storage.set(path, buffer);

		let mimeType = att.userOriginalContentType;
		if (att.userOriginalContentType === null) {
			const ft = await fileTypeFromBuffer(buffer);
			mimeType = att.contentType = ft?.mime || "application/octet-stream";
		}

		if (mimeType?.includes("image")) {
			const dimensions = imageSize(buffer);
			if (dimensions) {
				att.width = dimensions.width;
				att.height = dimensions.height;
			}
		}

		att.size = buffer.length;
		await att.save();

		console.log("[Cloud Upload] Saved attachment", att.id, att.userFilename);
		res.status(200).end();
	});
});

router.delete("/:channel_id/:batch_id/:attachment_id/:filename", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
	console.log("[Cloud Delete] Deleting attachment", req.params);

	const { channel_id, batch_id, attachment_id, filename } = req.params;
	const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;

	const att = await CloudAttachment.findOne({
		where: {
			uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
			channelId: channel_id,
			userAttachmentId: attachment_id,
			userFilename: filename,
		},
	});

	if (att) {
		await att.remove();
		await storage.delete(path);
		return res.send({ success: true });
	}
	return res.status(404).send("Attachment not found");
});

router.post("/:channel_id/:batch_id/:attachment_id/:filename/clone_to_message/:message_id", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
	console.log("[Cloud Clone] Cloning attachment to message", req.params);

	const { channel_id, batch_id, attachment_id, filename, message_id } = req.params;
	const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;
	const newPath = `attachments/${channel_id}/${message_id}/${filename}`;

	const att = await CloudAttachment.findOne({
		where: {
			uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
			channelId: channel_id,
			userAttachmentId: attachment_id,
			userFilename: filename,
		},
	});

	if (att) {
		await storage.clone(path, newPath);
		return res.send({ success: true, new_path: newPath });
	}

	return res.status(404).send("Attachment not found");
});

export default router;
