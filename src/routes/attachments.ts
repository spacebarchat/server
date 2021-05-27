import { Router } from "express";
import multer from "multer";
import { Config, Snowflake } from "@fosscord/server-util";
import { storage } from "../util/Storage";

const multer_ = multer({
	storage: multer.memoryStorage(),
	limits: {
		fields: 0,
		files: 1,
		fileSize: 1024 * 1024 * 100, // 100 mb
	},
});
const router = Router();

router.post("/:channel_id", multer_.single("attachment"), async (req, res) => {
	const { buffer, mimetype, stream, size, originalname, fieldname } = req.file;
	const { channel_id } = req.params;
	const filename = originalname.replaceAll(" ", "_").replace(/\W+/g, "");
	t;
	const endpoint = Config.get().cdn.endpoint || "http://localhost:3003";

	await storage.set(originalname, buffer);

	const id = Snowflake.generate();

	const file = {
		id,
		type: mimetype,
		content_type: mimetype,
		filename: originalname,
		size,
		url: `${endpoint}/attachments/${channel_id}/${id}/`,
	};

	return res.json(file);
});

router.get("/:hash/:filename", async (req, res) => {
	const { hash, filename } = req.params;

	const File = await db.data.attachments({ id: hash, filename: filename }).get();

	res.set("Content-Type", File.type);
	return res.send(Buffer.from(File.file, "base64"));
});

router.delete("/:hash/:filename", async (req, res) => {
	const { hash, filename } = req.params;

	await db.data.attachments({ id: hash, filename: filename }).delete();
	return res.send({ success: true, message: "attachment deleted" });
});

export default router;
