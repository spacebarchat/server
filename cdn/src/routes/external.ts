import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import { HTTPError } from "lambert-server";
import { Snowflake } from "@fosscord/util";
import { storage } from "../util/Storage";
import FileType, { stream } from "file-type";
import { Config } from "@fosscord/util";
import sharp from "sharp";

// TODO: somehow handle the deletion of images posted to the /external route

const router = Router();
const DEFAULT_FETCH_OPTIONS: any = {
	redirect: "follow",
	follow: 1,
	headers: {
		"user-agent":
			"Mozilla/5.0 (compatible Fosscordbot/0.1; +https://fosscord.com)",
	},
	size: 1024 * 1024 * 8,
	compress: true,
	method: "GET",
};

router.post("/", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");

	if (!req.body) throw new HTTPError("Invalid Body");

	const { url } = req.body;
	if (!url || typeof url !== "string") throw new HTTPError("Invalid url");

	const id = Snowflake.generate();

	try {
		const response = await fetch(url, DEFAULT_FETCH_OPTIONS);
		const buffer = await response.buffer();

		await storage.set(`/external/${id}`, buffer);

		res.send({ id });
	} catch (error) {
		throw new HTTPError("Couldn't fetch website");
	}
});

router.get("/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const file = await storage.get(`/external/${id}`);
	if (!file) throw new HTTPError("File not found");
	const result = await FileType.fromBuffer(file);

	res.set("Content-Type", result?.mime);

	return res.send(file);
});

// this method is gross lol don't care
router.get("/resize/:url", async (req: Request, res: Response) => {
	const url = decodeURIComponent(req.params.url);
	const { width, height } = req.query;
	if (!width || !height) throw new HTTPError("Must provide width and height");
	const w = parseInt(width as string);
	const h = parseInt(height as string);
	if (w < 1 || h < 1) throw new HTTPError("Width and height must be greater than 0");

	const { resizeHeightMax, resizeWidthMax } = Config.get().cdn;
	if (resizeHeightMax && resizeWidthMax &&
		(w > resizeWidthMax || h > resizeHeightMax))
		throw new HTTPError(`Width and height must not exceed ${resizeWidthMax}, ${resizeHeightMax}`);

	let buffer;
	try {
		const response = await fetch(url, DEFAULT_FETCH_OPTIONS);
		buffer = await response.buffer();
	}
	catch (e) {
		throw new HTTPError("Couldn't fetch website");
	}

	const resizedBuffer = await sharp(buffer)
		.resize(parseInt(width as string), parseInt(height as string), {
			fit: "inside",
		})
		.png()
		.toBuffer();

	res.setHeader("Content-Disposition", "attachment");
	res.setHeader("Content-Type", "image/png");
	return res.end(resizedBuffer);
});

export default router;
