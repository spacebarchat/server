import { Router, Response, Request } from "express";
import { Config, Snowflake } from "@fosscord/util";
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";
import { multer } from "../util/multer";
import imageSize from "image-size";

const router = Router();

const SANITIZED_CONTENT_TYPE = [
	"text/html",
	"text/mhtml",
	"multipart/related",
	"application/xhtml+xml",
];

router.post(
	"/:channel_id",
	multer.single("file"),
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");
		if (!req.file) throw new HTTPError("file missing");

		const { buffer, mimetype, size, originalname, fieldname } = req.file;
		const { channel_id } = req.params;
		const filename = originalname
			.replaceAll(" ", "_")
			.replace(/[^a-zA-Z0-9._]+/g, "");
		const id = Snowflake.generate();
		const path = `attachments/${channel_id}/${id}/${filename}`;

		const endpoint =
			Config.get()?.cdn.endpointPublic || "http://localhost:3003";

		await storage.set(path, buffer);
		var width;
		var height;
		if (mimetype.includes("image")) {
			const dimensions = imageSize(buffer);
			if (dimensions) {
				width = dimensions.width;
				height = dimensions.height;
			}
		}

		const file = {
			id,
			content_type: mimetype,
			filename: filename,
			size,
			url: `${endpoint}/${path}`,
			width,
			height,
		};

		return res.json(file);
	}
);

router.get(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		const { channel_id, id, filename } = req.params;

		const file = await storage.get(
			`attachments/${channel_id}/${id}/${filename}`
		);
		if (!file) throw new HTTPError("File not found");
		const type = await FileType.fromBuffer(file);
		let content_type = type?.mime || "application/octet-stream";

		if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
			content_type = "application/octet-stream";
		}

		res.set("Content-Type", content_type);
		res.set("Cache-Control", "public, max-age=31536000");

		return res.send(file);
	}
);

router.delete(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");

		const { channel_id, id, filename } = req.params;
		const path = `attachments/${channel_id}/${id}/${filename}`;

		await storage.delete(path);

		return res.send({ success: true });
	}
);

export default router;
