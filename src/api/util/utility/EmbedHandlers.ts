import { Config, Embed, EmbedType } from "@fosscord/util";
import fetch, { Response } from "node-fetch";
import * as cheerio from "cheerio";
import probe from "probe-image-size";
import imageSize from "image-size";

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

export const getMetaDescriptions = async (text: string) => {
	const $ = cheerio.load(text);

	return {
		title: $('meta[property="og:title"]').attr("content"),
		provider_name: $('meta[property="og:site_name"]').text(),
		author: $('meta[property="article:author"]').attr("content"),
		description:
			$('meta[property="og:description"]').attr("content") ||
			$('meta[property="description"]').attr("content"),
		image: $('meta[property="og:image"]').attr("content") || $(`meta[property="twitter:image"]`).attr("content"),
		width: parseInt(
			$('meta[property="og:image:width"]').attr("content") ||
			"",
		) || undefined,
		height: parseInt(
			$('meta[property="og:image:height"]').attr("content") ||
			"",
		) || undefined,
		url: $('meta[property="og:url"]').attr("content"),
		youtube_embed: $(`meta[property="og:video:secure_url"]`).attr("content"),
	};
};

const doFetch = async (url: URL) => {
	try {
		return await fetch(url, {
			...DEFAULT_FETCH_OPTIONS,
			size: Config.get().limits.message.maxEmbedDownloadSize,
		});
	}
	catch (e) {
		return null;
	}
};

const genericImageHandler = async (url: URL): Promise<Embed | null> => {
	const response = await doFetch(url);
	if (!response) return null;
	const metas = await getMetaDescriptions(await response.text());

	if (!metas.width || !metas.height) {
		const result = await probe(url.href);
		metas.width = result.width;
		metas.height = result.height;
	}

	return {
		url: url.href,
		type: EmbedType.image,
		thumbnail: {
			width: metas.width,
			height: metas.height,
			url: url.href,
			proxy_url: getProxyUrl(new URL(metas.image || url.href), metas.width, metas.height),
		}
	};
};

export const EmbedHandlers: { [key: string]: (url: URL) => Promise<Embed | null>; } = {
	// the url does not have a special handler
	"default": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;

		if (response.headers.get("content-type")?.indexOf("image") !== -1) {
			// this is an image

			const size = imageSize(await response.buffer());

			return {
				url: url.href,
				type: EmbedType.image,
				image: {
					width: size.width,
					height: size.height,
					url: url.href,
					proxy_url: getProxyUrl(url, size.width!, size.height!),
				}
			};
		}

		const metas = await getMetaDescriptions(await response.text());
		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			thumbnail: {
				width: metas.width,
				height: metas.height,
				url: metas.image,
				proxy_url: getProxyUrl(new URL(metas.image!), metas.width!, metas.height!),
			},
			description: metas.description,
		};
	},

	"giphy.com": genericImageHandler,
	"media4.giphy.com": genericImageHandler,
	"tenor.com": genericImageHandler,
	"c.tenor.com": genericImageHandler,
	"media.tenor.com": genericImageHandler,

	// TODO: twitter, facebook
	// have to use their APIs or something because they don't send the metas in initial html

	"open.spotify.com": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = await getMetaDescriptions(await response.text());

		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			description: metas.description,
			thumbnail: {
				width: 640,
				height: 640,
				proxy_url: getProxyUrl(new URL(metas.image!), 640, 640),
				url: metas.image,
			},
			provider: {
				url: "https://spotify.com",
				name: "Spotify",
			}
		};
	},

	"pixiv.net": async (url: URL) => { return EmbedHandlers["www.pixiv.net"](url); },
	"www.pixiv.net": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = await getMetaDescriptions(await response.text());

		// TODO: doesn't show images. think it's a bug in the cdn
		return {
			url: url.href,
			type: EmbedType.image,
			title: metas.title,
			description: metas.description,
			image: {
				width: metas.width,
				height: metas.height,
				url: url.href,
				proxy_url: getProxyUrl(new URL(metas.image!), metas.width!, metas.height!),
			},
			provider: {
				url: "https://pixiv.net",
				name: "Pixiv"
			}
		};
	},

	"store.steampowered.com": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = await getMetaDescriptions(await response.text());

		return {
			url: url.href,
			type: EmbedType.rich,
			title: metas.title,
			description: metas.description,
			image: {	// TODO: meant to be thumbnail.
				// isn't this standard across all of steam?
				width: 460,
				height: 215,
				url: metas.image,
				proxy_url: getProxyUrl(new URL(metas.image!), 460, 215),
			},
			provider: {
				url: "https://store.steampowered.com",
				name: "Steam"
			},
			// TODO: fields for release date
			// TODO: Video
		};
	},

	"reddit.com": async (url: URL) => { return EmbedHandlers["www.reddit.com"](url); },
	"www.reddit.com": async (url: URL) => {
		const res = await EmbedHandlers["default"](url);
		return {
			...res,
			color: 16777215,
			provider: {
				name: "reddit"
			}
		};
	},

	"youtube.com": async (url: URL) => { return EmbedHandlers["www.youtube.com"](url); },
	"www.youtube.com": async (url: URL): Promise<Embed | null> => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = await getMetaDescriptions(await response.text());

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