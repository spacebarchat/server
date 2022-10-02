import { Config, Embed, EmbedType } from "@fosscord/util";
import fetch, { Response } from "node-fetch";
import * as cheerio from "cheerio";
import probe from "probe-image-size";
import crypto from "crypto";

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
	const { endpointPublic, resizeWidthMax, resizeHeightMax, imagorServerUrl } = Config.get().cdn;
	const secret = Config.get().security.jwtSecret;	// maybe shouldn't use this?
	width = Math.min(width || 500, resizeWidthMax || width);
	height = Math.min(height || 500, resizeHeightMax || width);

	// Imagor
	if (imagorServerUrl) {
		let path = `${width}x${height}/${url.host}${url.pathname}`;

		const hash = crypto.createHmac('sha1', secret)
			.update(path)
			.digest('base64')
			.replace(/\+/g, '-').replace(/\//g, '_');

		return `${imagorServerUrl}/${hash}/${path}`;
	}

	// Fosscord CDN resizer
	return `${endpointPublic}/external/resize/${encodeURIComponent(url.href)}?width=${width}&height=${height}`;
};

const getMeta = ($: cheerio.CheerioAPI, name: string): string | undefined => {
	let elem = $(`meta[property="${name}"]`);
	if (!elem.length) elem = $(`meta[name="${name}"]`);
	return elem.attr("content") || elem.text();
};

export const getMetaDescriptions = (text: string) => {
	const $ = cheerio.load(text);

	return {
		title: getMeta($, "og:title") || $("title").first().text(),
		provider_name: getMeta($, "og:site_name"),
		author: getMeta($, "article:author"),
		description: getMeta($, "og:description") || getMeta($, "description"),
		image: getMeta($, "og:image") || getMeta($, "twitter:image"),
		image_fallback: $(`image`).attr("src"),
		video_fallback: $(`video`).attr("src"),
		width: parseInt(getMeta($, "og:image:width")!) || 0,
		height: parseInt(getMeta($, "og:image:height")!) || 0,
		url: getMeta($, "og:url"),
		youtube_embed: getMeta($, "og:video:secure_url"),
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
	const type = await fetch(url, {
		...DEFAULT_FETCH_OPTIONS,
		method: "HEAD",
	});

	let width, height, image;

	if (type.headers.get("content-type")?.indexOf("image") !== -1) {
		const result = await probe(url.href);
		width = result.width;
		height = result.height;
		image = url.href;
	}
	else if (type.headers.get("content-type")?.indexOf("video") !== -1) {
		// TODO
		return null;
	}
	else {
		// have to download the page, unfortunately
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(await response.text());
		width = metas.width;
		height = metas.height;
		image = metas.image || metas.image_fallback;
	}

	if (!width || !height || !image) return null;

	return {
		url: url.href,
		type: EmbedType.image,
		thumbnail: {
			width: width,
			height: height,
			url: url.href,
			proxy_url: getProxyUrl(new URL(image), width, height),
		}
	};
};

export const EmbedHandlers: { [key: string]: (url: URL) => Promise<Embed | null>; } = {
	// the url does not have a special handler
	"default": async (url: URL) => {
		const type = await fetch(url, {
			...DEFAULT_FETCH_OPTIONS,
			method: "HEAD",
		});
		if (type.headers.get("content-type")?.indexOf("image") !== -1)
			return await genericImageHandler(url);

		const response = await doFetch(url);
		if (!response) return null;

		const metas = getMetaDescriptions(await response.text());

		// TODO: handle video

		if (!metas.image) metas.image = metas.image_fallback;

		if (metas.image && (!metas.width || !metas.height)) {
			const result = await probe(metas.image);
			metas.width = result.width;
			metas.height = result.height;
		}

		if (!metas.image && (!metas.title || !metas.description)) {
			return null;
		}

		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			thumbnail: {
				width: metas.width,
				height: metas.height,
				url: metas.image,
				proxy_url: metas.image ? getProxyUrl(new URL(metas.image), metas.width!, metas.height!) : undefined,
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
		const metas = getMetaDescriptions(await response.text());

		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			description: metas.description,
			thumbnail: {
				width: 640,
				height: 640,
				proxy_url: metas.image ? getProxyUrl(new URL(metas.image!), 640, 640) : undefined,
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
		const metas = getMetaDescriptions(await response.text());

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
				proxy_url: metas.image ? getProxyUrl(new URL(metas.image!), metas.width!, metas.height!) : undefined,
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
		const metas = getMetaDescriptions(await response.text());

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
				proxy_url: metas.image ? getProxyUrl(new URL(metas.image!), 460, 215) : undefined,
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
		const metas = getMetaDescriptions(await response.text());

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
				proxy_url: metas.image ? getProxyUrl(new URL(metas.image!), metas.width!, metas.height!) : undefined,
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