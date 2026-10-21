/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type { GifsResponse, GifTrendingCategory, GifResponse } from "@spacebar/schemas";
import { Config } from "@spacebar/util";
import { SingletonCache, TimeSpan } from "@spacebar/extensions";
import type { IGifProvider } from "../IGifProvider";

const TRENDING_CATEGORIES_CACHE_DURATION = TimeSpan.fromSeconds(24 * 60 * 60); // 1 day
const TRENDING_GIFS_CACHE_DURATION = TimeSpan.fromSeconds(60 * 60); // 1 hour
const ORIGINCHAT_URL = "https://gifs.originchats.com";

// OriginChat Gif
export default class OriginChatGifProvider implements IGifProvider {
    id = "originchat";
    available = true;
    #trendingCategoryCache = new SingletonCache<GifTrendingCategory[]>(TRENDING_CATEGORIES_CACHE_DURATION);
    #trendingGifsCache = new SingletonCache<GifsResponse>(TRENDING_GIFS_CACHE_DURATION);

    async init(): Promise<void> {
        if (!Config.get().integrations.gifs.originchat.enabled) {
            this.available = false;
            return;
        }
        console.log("[OriginChatGifProvider] Hellorld!");
    }

    async search(query: { q: string; limit?: number; media_format: string; locale: string }): Promise<GifsResponse> {
        //query.limit ??= 100; the default for OriginChat is 24 and max 100
        const response = await fetch(`${ORIGINCHAT_URL}/api/gifs?q=${query.q}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) console.log(response, await response.text());
        const responseData = (await response.json()) as OriginChatGifsResponse;
        return responseData.gifs.map(this.convertGifResult);
    }

    async getTrendingCategories(query: { locale: string }): Promise<GifTrendingCategory[]> {
        return await this.#trendingCategoryCache.getOrUpdate(async () => {
            const response = await fetch(`${ORIGINCHAT_URL}/api/gifs/tags`, {
                method: "get",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) console.log(response, await response.text());
            const responseData = (await response.json()) as OriginChatCategoriesResponse;
            return responseData.tags.map((x) => ({
                name: x.tag,
                src: ORIGINCHAT_URL + x.preview_gif.url,
            })) satisfies GifTrendingCategory[];
        });
    }

    async getTrendingGifs(query: { media_format: string; locale: string }): Promise<GifsResponse> {
        return await this.#trendingGifsCache.getOrUpdate(async () => {
            const response = await fetch(`${ORIGINCHAT_URL}/api/gifs/trending`, {
                method: "get",
                signal: AbortSignal.timeout(10000),
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) console.log(response, await response.text());
            const responseData = (await response.json()) as OriginChatGifsResponse;
            return responseData.gifs.map(this.convertGifResult);
        });
    }

    private convertGifResult(result: OriginChatMediaItem) {
        return {
            id: result.id,
            title: result.title,
            url: ORIGINCHAT_URL + result.url,
            src: ORIGINCHAT_URL + result.url,
            gif_src: ORIGINCHAT_URL + result.url,
            width: result.width,
            height: result.height,
            preview: ORIGINCHAT_URL + result.url,
        } satisfies GifResponse;
    }
}

// API response types
interface OriginChatCategoriesResponse {
    ok: boolean;
    tags: { count: number; preview_gif: OriginChatMediaItem; tag: string }[];
}

interface OriginChatGifsResponse {
    ok: boolean;
    gifs: OriginChatMediaItem[];
    total: number;
    offset: number;
    limit: number;
}

interface OriginChatMediaItem {
    id: string; // unique ID
    title: string;
    tags: string[]; // owner tags
    communityTags: string[]; // community-curated tags
    uploaderId: string; // rotur user ID
    uploaderName: string; // rotur username
    width: number; // pixels
    height: number; // pixels
    size: number; // bytes
    uploadedAt: number; // unix ms
    views: number;
    likes: number;
    url: string; // absolute path to raw GIF
}
