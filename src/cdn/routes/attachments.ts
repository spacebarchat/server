import { Config, HTTPError, Snowflake } from "@fosscord/util";
import { Request, Response, Router } from "express";
import FileType from "file-type";
import imageSize from "image-size";
import { multer } from "../util/multer";
import { storage } from "../util/Storage";

const router = Router();

const SANITIZED_CONTENT_TYPE = ["text/html", "text/mhtml", "multipart/related", "application/xhtml+xml"];

router.post("/:channel_id", multer.single("file"), async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError(req.t("common:body.INVALID_REQUEST_SIGNATURE"));
	if (!req.file) throw new HTTPError(req.t("common:body.MISSING_FILE"));

	const { buffer, mimetype, size, originalname, fieldname } = req.file;
	const { channel_id } = req.params;
	const filename = originalname.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
	const id = Snowflake.generate();
	const path = `attachments/${channel_id}/${id}/${filename}`;

	const endpoint = Config.get()?.cdn.endpointPublic || "http://localhost:3003";

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

	const file = {
		id,
		content_type: mimetype,
		filename: filename,
		size,
		url: `${endpoint}/${path}`,
		width,
		height
	};

	return res.json(file);
});

router.get("/:channel_id/:id/:filename", async (req: Request, res: Response) => {
	const { channel_id, id, filename } = req.params;

	const file = await storage.get(`attachments/${channel_id}/${id}/${filename}`);
	if (!file) throw new HTTPError(req.t("common:notfound.FILE"));
	const type = await FileType.fromBuffer(file);
	let content_type = type?.mime || "application/octet-stream";

	if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
		content_type = "application/octet-stream";
	}

	res.set("Content-Type", content_type);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});

router.delete("/:channel_id/:id/:filename", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError(req.t("common:body.INVALID_REQUEST_SIGNATURE"));

	const { channel_id, id, filename } = req.params;
	const path = `attachments/${channel_id}/${id}/${filename}`;

	await storage.delete(path);

	return res.send({ success: true });
});

export default router;
