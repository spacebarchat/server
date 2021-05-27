import { Router } from "express";
import multer from "multer";
import { Snowflake } from "@fosscord/server-util";
import { storage } from "../util/Storage";

const multer_ = multer();
const router = Router();

type Attachment = {
	filename: string;
	file: string;
	id: string;
	type: string;
};
router.post("/:filename", multer_.single("attachment"), async (req, res) => {
	const { buffer, mimetype } = req.file;
	const { filename } = req.params;

	// storage.set(filename, );

	const File: Attachment = {
		filename,
		file: buffer.toString("base64"),
		id: Snowflake.generate(),
		type: mimetype,
	};
});

router.get("/:hash/:filename", async (req, res) => {
	const { hash, filename } = req.params;

	const File: Attachment = await db.data.attachments({ id: hash, filename: filename }).get();

	res.set("Content-Type", File.type);
	return res.send(Buffer.from(File.file, "base64"));
});

router.delete("/:hash/:filename", async (req, res) => {
	const { hash, filename } = req.params;

	await db.data.attachments({ id: hash, filename: filename }).delete();
	return res.send({ success: true, message: "attachment deleted" });
});

export default router;
