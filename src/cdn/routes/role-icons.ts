import { Config, HTTPError, Snowflake } from "@fosscord/util";
import crypto from "crypto";
import { Request, Response, Router } from "express";
import FileType from "file-type";
import { multer } from "../util/multer";
import { storage } from "../util/Storage";

//Role icons ---> avatars.ts modified

// TODO: check user rights and perks and animated pfp are allowed in the policies
// TODO: generate different sizes of icon
// TODO: generate different image types of icon

const STATIC_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/svg"];
const ALLOWED_MIME_TYPES = [...STATIC_MIME_TYPES];

const router = Router();

router.post("/:role_id", multer.single("file"), async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError(req.t("common:body.INVALID_REQUEST_SIGNATURE"));
	if (!req.file) throw new HTTPError(req.t("common:body.MISSING_FILE"));
	const { buffer, mimetype, size, originalname, fieldname } = req.file;
	const { role_id } = req.params;

	let hash = crypto.createHash("md5").update(Snowflake.generate()).digest("hex");

	const type = await FileType.fromBuffer(buffer);
	if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) throw new HTTPError("Invalid file type");

	const path = `role-icons/${role_id}/${hash}.png`;
	const endpoint = Config.get().cdn.endpointPublic || "http://localhost:3003";

	await storage.set(path, buffer);

	return res.json({
		id: hash,
		content_type: type.mime,
		size,
		url: `${endpoint}${req.baseUrl}/${role_id}/${hash}`
	});
});

router.get("/:role_id", async (req: Request, res: Response) => {
	let { role_id } = req.params;
	//role_id = role_id.split(".")[0]; // remove .file extension
	const path = `role-icons/${role_id}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError(req.t("common:notfound.FILE"), 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000, must-revalidate");

	return res.send(file);
});

router.get("/:role_id/:hash", async (req: Request, res: Response) => {
	let { role_id, hash } = req.params;
	//hash = hash.split(".")[0]; // remove .file extension
	const path = `role-icons/${role_id}/${hash}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError(req.t("common:notfound.FILE"), 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000, must-revalidate");

	return res.send(file);
});

router.delete("/:role_id/:id", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError(req.t("common:body.INVALID_REQUEST_SIGNATURE"));
	const { role_id, id } = req.params;
	const path = `role-icons/${role_id}/${id}`;

	await storage.delete(path);

	return res.send({ success: true });
});

export default router;
