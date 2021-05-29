import { Router } from "express";
import { Config, Snowflake } from "@fosscord/server-util";
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";
import { multer } from "../Server";
import crypto from "crypto";

// TODO: check premium and animated pfp are allowed in the config
// TODO: generate different sizes of avatar
// TODO: generate different image types of avatar
// TODO: delete old avatars
// TODO: check request signature for modify methods

const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_MIME_TYPES = [...ANIMATED_MIME_TYPES, ...STATIC_MIME_TYPES];

const router = Router();

router.post("/:user_id", multer.single("file"), async (req, res) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");
	if (!req.file) throw new HTTPError("Missing file");
	const { buffer, mimetype, size, originalname, fieldname } = req.file;
	const { user_id } = req.params;

	const id = crypto.createHash("md5").update(Snowflake.generate()).digest("hex");

	const type = await FileType.fromBuffer(buffer);
	if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) throw new HTTPError("Invalid file type");
	const path = `avatars/${user_id}/${id}`;
	const endpoint = Config.get().cdn.endpoint || "http://localhost:3003";

	await storage.set(path, buffer);

	return res.json({
		id,
		content_type: type.mime,
		size,
		url: `${endpoint}/path`,
	});
});

router.get("/:user_id/:id", async (req, res) => {
	var { user_id, id } = req.params;
	id = id.split(".")[0];
	const path = `avatars/${user_id}/${id}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);

	return res.send(file);
});

router.delete("/:user_id/:id", async (req, res) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");
	const { user_id, id } = req.params;
	const path = `avatars/${user_id}/${id}`;

	await storage.delete(path);

	return res.send({ success: true });
});

export default router;
