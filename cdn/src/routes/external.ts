// @ts-nocheck
import bodyParser from "body-parser";
import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import { HTTPError } from "lambert-server";
import { Snowflake } from "@fosscord/util";
import { storage } from "../util/Storage";

const router = Router();

type crawled = {
	id: string;
	ogTitle: string;
	ogType: string;
	ogDescription: string;
	ogUrl: string;
	cachedImage: string;
};

const DEFAULT_FETCH_OPTIONS: any = {
	redirect: "follow",
	follow: 1,
	headers: {
		"user-agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
	},
	size: 1024 * 1024 * 8,
	compress: true,
	method: "GET",
};

router.post("/", bodyParser.json(), async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");
	if (!req.body) throw new HTTPError("Invalid Body");
	const { url } = req.body;
	if (!url || typeof url !== "string") throw new HTTPError("Invalid url");

	const id = Snowflake.generate();

	try {
		const response = await fetch(ogImage, DEFAULT_FETCH_OPTIONS);
		const buffer = await response.buffer();

		await storage.set(`/external/${id}`, buffer);

		res.send({ id });
	} catch (error) {
		throw new HTTPError("Couldn't fetch website");
	}
});

router.get("/:id/", async (req: Request, res: Response) => {
	const { id } = req.params;

	const file = await storage.get(`/external/${id}`);
	if (!file) throw new HTTPError("File not found");
	const result = await FileType.fromBuffer(file);

	res.set("Content-Type", result?.mime);

	return res.send(file);
});

export default router;
