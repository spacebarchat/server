import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import { route } from "@fosscord/api";
import { getGifApiKey, parseGifResult } from "./trending";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: Custom providers
	const { media_format, locale } = req.query;

	const apiKey = getGifApiKey();

	const response = await fetch(`https://g.tenor.com/v1/trending?media_format=${media_format}&locale=${locale}&key=${apiKey}`, {
		method: "get",
		headers: { "Content-Type": "application/json" }
	});

	const { results } = await response.json();

	res.json(results.map(parseGifResult)).status(200);
});

export default router;
