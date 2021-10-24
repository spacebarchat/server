import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import ProxyAgent from 'proxy-agent';
import { route } from "@fosscord/api";
import { getGifApiKey, parseGifResult } from "./trending";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: Custom providers
	const { q, media_format, locale } = req.query;

	const apiKey = getGifApiKey();
	
	const agent = new ProxyAgent();

	const response = await fetch(`https://g.tenor.com/v1/search?q=${q}&media_format=${media_format}&locale=${locale}&key=${apiKey}`, {
		agent,
		method: "get",
		headers: { "Content-Type": "application/json" }
	});

	const { results } = await response.json();

	res.json(results.map(parseGifResult)).status(200);
});

export default router;
