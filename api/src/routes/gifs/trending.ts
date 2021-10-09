import { Router, Response, Request } from "express";
import fetch from "node-fetch";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: Custom providers and code quality
	const { media_format, locale, provider } = req.query;

	const parseResult = (result: any) => {
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
	};

	const responseSource = await fetch(`https://g.tenor.com/v1/categories?media_format=${media_format}&locale=${locale}&key=LIVDSRZULELA`, {
		method: "get",
		headers: { "Content-Type": "application/json" }
	});

	const trendGifSource = await fetch(`https://g.tenor.com/v1/trending?media_format=${media_format}&locale=${locale}&key=LIVDSRZULELA`, {
		method: "get",
		headers: { "Content-Type": "application/json" }
	});

	const { tags } = await responseSource.json();
	const { results } = await trendGifSource.json();
	let cache = new Array() as any[];

	tags.forEach((result: any) => {
		cache.push({
			name: result.searchterm,
			src: result.image
		});
	});

	res.json({ categories: [cache], gifs: [parseResult(results[0])] }).status(200);
});

export default router;
