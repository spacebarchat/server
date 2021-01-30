/**
 * * patch to redirect requests from cloned client
 * (../../client/index.html)
 */
import { Router } from "express";
import fetch, { Response } from "node-fetch";

const router: Router = Router();
const cache = new Map<string, Response>();
const assetEndpoint = "https://discord.com/assets/";

export async function getCache(key: string): Promise<Response> {
	let cachedRessource = cache.get(key);

	if (!cachedRessource) {
		const res = await fetch(assetEndpoint + key);
		// @ts-ignore
		res.bufferResponse = await res.buffer();
		cache.set(key, res);
		cachedRessource = res;
	}

	return cachedRessource;
}

router.get("/:hash", async (req, res) => {
	res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
	const cache = await getCache(req.params.hash);
	res.set("content-type", <string>cache.headers.get("content-type"));
	// @ts-ignore
	res.send(cache.bufferResponse);
});

export default router;
