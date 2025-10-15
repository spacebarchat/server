import { HTTPError } from "lambert-server";
import { Config } from "./Config";
import { TenorGif } from "@spacebar/schemas";

export function parseGifResult(result: TenorGif) {
	return {
		id: result.id,
		title: result.title,
		url: result.itemurl,
		src: result.media[0].mp4.url,
		gif_src: result.media[0].gif.url,
		width: result.media[0].mp4.dims[0],
		height: result.media[0].mp4.dims[1],
		preview: result.media[0].mp4.preview,
	};
}

export function getGifApiKey() {
	const { enabled, provider, apiKey } = Config.get().gif;
	if (!enabled) throw new HTTPError(`Gifs are disabled`);
	if (provider !== "tenor" || !apiKey)
		throw new HTTPError(`${provider} gif provider not supported`);

	return apiKey;
}
