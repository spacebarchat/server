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

export const getProxyUrl = (url: URL, width: number, height: number): string => {
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

export const EmbedHandlers: { [key: string]: (url: URL) => Promise<Embed | Embed[] | null>; } = {
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

	"twitter.com": (url: URL) => { return EmbedHandlers["www.twitter.com"](url); },
	"www.twitter.com": async (url: URL) => {
		const token = Config.get().external.twitter;
		if (!token) return null; // todo move to config

		if (!url.href.includes("/status/")) return null;	// TODO;
		const id = url.pathname.split("/")[3];	// super bad lol
		if (!parseInt(id)) return null;
		const endpointUrl = `https://api.twitter.com/2/tweets/${id}`
			+ `?expansions=author_id,attachments.media_keys`
			+ `&media.fields=url,width,height`
			+ `&tweet.fields=created_at,public_metrics`
			+ `&user.fields=profile_image_url`;


		const response = await fetch(endpointUrl, {
			...DEFAULT_FETCH_OPTIONS,
			headers: {
				authorization: `Bearer ${token}`,
			}
		});
		const json = await response.json();
		if (json.errors) return null;
		const author = json.includes.users[0];
		const text = json.data.text;
		const created_at = new Date(json.data.created_at);
		const metrics = json.data.public_metrics;
		let media = json.includes.media?.filter((x: any) => x.type == "photo") as any[];	// TODO: video

		const embed: Embed = {
			type: EmbedType.rich,
			url: `${url.origin}${url.pathname}`,
			description: text,
			author: {
				url: `https://twitter.com/${author.username}`,
				name: `${author.name} (@${author.username})`,
				proxy_icon_url: getProxyUrl(new URL(author.profile_image_url), 400, 400),
				icon_url: author.profile_image_url,
			},
			timestamp: created_at,
			fields: [
				{ inline: true, name: "Likes", value: metrics.like_count.toString() },
				{ inline: true, name: "Retweet", value: metrics.retweet_count.toString() },
			],
			color: 1942002,
			footer: {
				text: "Twitter",
				proxy_icon_url: getProxyUrl(new URL("https://abs.twimg.com/icons/apple-touch-icon-192x192.png"), 192, 192),
				icon_url: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"
			},
			// Discord doesn't send this?
			// provider: {
			// 	name: "Twitter",
			// 	url: "https://twitter.com"
			// },
		};

		if (media) {
			embed.image = {
				width: media[0].width,
				height: media[0].height,
				url: media[0].url,
				proxy_url: getProxyUrl(new URL(media[0].url), media[0].width, media[0].height)
			};
			media.shift();
		}

		return embed;

		// TODO: Client won't merge these into a single embed, for some reason.
		// return [embed, ...media.map((x: any) => ({
		// 	// generate new embeds for each additional attachment
		// 	type: EmbedType.rich,
		// 	url: url.href,
		// 	image: {
		// 		width: x.width,
		// 		height: x.height,
		// 		url: x.url,
		// 		proxy_url: getProxyUrl(new URL(x.url), x.width, x.height)
		// 	}
		// }))];
	},

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

	"pixiv.net": (url: URL) => { return EmbedHandlers["www.pixiv.net"](url); },
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

	"reddit.com": (url: URL) => { return EmbedHandlers["www.reddit.com"](url); },
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

	"youtube.com": (url: URL) => { return EmbedHandlers["www.youtube.com"](url); },
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
};;