import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import ProxyAgent from 'proxy-agent';
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";
import { HTTPError } from "lambert-server";

const router = Router();

export function parseGifResult(result: any) {
	return {
		id: result.id,
		title: result.title,
		url: result.itemurl,
		src: result.media[0].mp4.url,
		gif_src: result.media[0].gif.url,
		width: result.media[0].mp4.dims[0],
		height: result.media[0].mp4.dims[1],
		preview: result.media[0].mp4.preview
	};
}

export function getGifApiKey() {
	const { enabled, provider, apiKey } = Config.get().gif;
	if (!enabled) throw new HTTPError(`Gifs are disabled`);
	if (provider !== "tenor" || !apiKey) throw new HTTPError(`${provider} gif provider not supported`);

	return apiKey;
}

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: Custom providers
	// TODO: return gifs as mp4
	const { media_format, locale } = req.query;

	const apiKey = getGifApiKey();
	
	const agent = new ProxyAgent();

	const [responseSource, trendGifSource] = await Promise.all([
		fetch(`https://g.tenor.com/v1/categories?locale=${locale}&key=${apiKey}`, {
			agent,
			method: "get",
			headers: { "Content-Type": "application/json" }
		}),
		fetch(`https://g.tenor.com/v1/trending?locale=${locale}&key=${apiKey}`, {
			agent,
			method: "get",
			headers: { "Content-Type": "application/json" }
		})
	]);

	const { tags } = await responseSource.json();
	const { results } = await trendGifSource.json();

	res.json({
		categories: tags.map((x: any) => ({ name: x.searchterm, src: x.image })),
		gifs: [parseGifResult(results[0])]
	}).status(200);
});

export default router;
