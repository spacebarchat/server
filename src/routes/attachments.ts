import { Router } from "express";
import multer from "multer";
import { Config, Snowflake } from "@fosscord/server-util";
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";

const multer_ = multer({
	storage: multer.memoryStorage(),
	limits: {
		fields: 0,
		files: 1,
		fileSize: 1024 * 1024 * 100, // 100 mb
	},
});
const router = Router();

router.post("/:channel_id", multer_.single("file"), async (req, res) => {
	const { buffer, mimetype, size, originalname, fieldname } = req.file;
	const { channel_id } = req.params;
	const filename = originalname.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
	const id = Snowflake.generate();
	const path = `attachments/${channel_id}/${id}/${filename}`;

	const endpoint = Config.get().cdn.endpoint || "http://localhost:3003";

	await storage.set(path, buffer);

	const file = {
		id,
		content_type: mimetype,
		filename: filename,
		size,
		url: `${endpoint}/attachments/${channel_id}/${id}/${filename}`,
	};

	return res.json(file);
});

router.get("/:channel_id/:id/:filename", async (req, res) => {
	const { channel_id, id, filename } = req.params;

	const file = await storage.get(`attachments/${channel_id}/${id}/${filename}`);
	if (!file) throw new HTTPError("File not found");
	const result = await FileType.fromBuffer(file);

	res.set("Content-Type", result?.mime);

	return res.send(file);
});

router.delete("/:channel_id/:id/:filename", async (req, res) => {
	const { channel_id, id, filename } = req.params;
	const path = `attachments/${channel_id}/${id}/${filename}`;

	storage.delete(path);

	return res.send({ success: true, message: "attachment deleted" });
});

export default router;
