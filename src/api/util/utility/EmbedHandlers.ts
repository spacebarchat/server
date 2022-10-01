import { Config, Embed, EmbedType } from "@fosscord/util";
import fetch, { Response } from "node-fetch";
import * as cheerio from "cheerio";
import probe from "probe-image-size";

export const DEFAULT_FETCH_OPTIONS: any = {
	redirect: "follow",
	follow: 1,
	headers: {
		"user-agent":
			"Mozilla/5.0 (compatible; Fosscord/1.0; +https://github.com/fosscord/fosscord)",
	},
	// size: 1024 * 1024 * 5, 	// grabbed from config later
	compress: true,
	method: "GET",
};

export const getProxyUrl = (url: URL, width: number, height: number) => {
	const { endpointPublic, resizeWidthMax, resizeHeightMax } = Config.get().cdn;
	width = Math.min(width || 500, resizeWidthMax || width);
	height = Math.min(height || 500, resizeHeightMax || width);
	return `${endpointPublic}/external/resize/${encodeURIComponent(url.href)}?width=${width}&height=${height}`;
};

export const getMetaDescriptions = async (url: URL) => {
	let response: Response;
	try {
		response = await fetch(url, {
			...DEFAULT_FETCH_OPTIONS,
			size: Config.get().limits.message.maxEmbedDownloadSize,
		});
	}
	catch (e) {
		return null;
	}

	const text = await response.text();
	const $ = cheerio.load(text);

	return {
		title: $('meta[property="og:title"]').attr("content"),
		provider_name: $('meta[property="og:site_name"]').text(),
		author: $('meta[property="article:author"]').attr("content"),
		description:
			$('meta[property="og:description"]').attr("content") ||
			$('meta[property="description"]').attr("content"),
		image: $('meta[property="og:image"]').attr("content"),
		width: parseInt(
			$('meta[property="og:image:width"]').attr("content") ||
			"",
		) || undefined,
		height: parseInt(
			$('meta[property="og:image:height"]').attr("content") ||
			"",
		) || undefined,
		url: $('meta[property="og:url"]').attr("content"),
		youtube_embed: $(`meta[property="og:video:secure_url"]`).attr("content")
	};
};

const genericImageHandler = async (url: URL): Promise<Embed | null> => {
	const metas = await getMetaDescriptions(url);
	if (!metas) return null;

	const result = await probe(url.href);

	const width = metas.width || result.width;
	const height = metas.height || result.height;

	return {
		url: url.href,
		type: EmbedType.image,
		thumbnail: {
			width: width,
			height: height,
			url: url.href,
			proxy_url: getProxyUrl(url, result.width, result.height),
		}
	};
};

export const EmbedHandlers: { [key: string]: (url: URL) => Promise<Embed | null>; } = {
	// the url does not have a special handler
	"default": genericImageHandler,

	"giphy.com": genericImageHandler,
	"media4.giphy.com": genericImageHandler,
	"tenor.com": genericImageHandler,
	"c.tenor.com": genericImageHandler,
	"media.tenor.com": genericImageHandler,

	"www.youtube.com": async (url: URL): Promise<Embed | null> => {
		const metas = await getMetaDescriptions(url);
		if (!metas) return null;

		return {
			video: {
				// TODO: does this adjust with aspect ratio?
				width: metas.width,
				height: metas.height,
				url: metas.youtube_embed!,
			},
			url: url.href,
			type: EmbedType.video,
			title: metas.title,
			thumbnail: {
				width: metas.width,
				height: metas.height,
				url: metas.image,
				proxy_url: getProxyUrl(new URL(metas.image!), metas.width!, metas.height!),
			},
			provider: {
				url: "https://www.youtube.com",
				name: "YouTube",
			},
			description: metas.description,
			color: 16711680,
			author: {
				name: metas.author,
				// TODO: author channel url
			}
		};
	},

	// the url is an image from this instance
	"self": async (url: URL): Promise<Embed | null> => {
		const result = await probe(url.href);

		return {
			url: url.href,
			type: EmbedType.image,
			thumbnail: {
				width: result.width,
				height: result.height,
				url: url.href,
				proxy_url: url.href,
			}
		};
	},
};