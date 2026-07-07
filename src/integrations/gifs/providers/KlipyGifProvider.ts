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

import fs from "node:fs/promises";
import type { GifsResponse, GifTrendingCategory, GifMediaTypes, GifResponse } from "@spacebar/schemas";
import { Config } from "@spacebar/util";
import { SingletonCache, TimeSpan } from "@spacebar/extensions";
import type { IGifProvider } from "../IGifProvider";

const TRENDING_CATEGORIES_CACHE_DURATION = TimeSpan.fromSeconds(24 * 60 * 60); // 1 day
const TRENDING_GIFS_CACHE_DURATION = TimeSpan.fromSeconds(60 * 60); // 1 hour

// Klipy v1 API
export default class KlipyGifProvider implements IGifProvider {
    id = "klipy";
    available = true;
    #apiKey: string;
    #trendingCategoryCache = new SingletonCache<GifTrendingCategory[]>(TRENDING_CATEGORIES_CACHE_DURATION);
    #trendingGifsCache = new SingletonCache<GifsResponse>(TRENDING_GIFS_CACHE_DURATION);

    async init(): Promise<void> {
        if (!Config.get().integrations.gifs.klipy.enabled) {
            this.available = false;
            return;
        }

        let apiKey = Config.get().integrations.gifs.klipy.apiKey;
        if (!apiKey) {
            const path = Config.get().integrations.gifs.klipy.apiKeyPath;
            if (!(path && (await fs.stat(path)))) {
                console.warn("[KlipyGifProvider] Klipy integration is enabled but no API key was provided, disabling...");
                this.available = false;
                return;
            }
            apiKey = (await fs.readFile(path, "utf-8")).trim();
        }

        this.#apiKey = apiKey;
        console.log("[KlipyGifProvider] Hellorld!");
    }

    async search(query: { q: string; limit?: number; media_format: string; locale: string }): Promise<GifsResponse> {
        query.media_format ??= "gif";
        query.locale ??= "en";
        const response = await fetch(`https://api.klipy.com/api/v1/${this.#apiKey}/gifs/search?q=${query.q}&locale=${query.locale}`, {
            method: "get",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) console.log(response, await response.text());
        const responseData = (await response.json()) as KlipyGifsResponse;
        return responseData.data.data.map(this.convertGifResult);
    }

    async getTrendingCategories(query: { locale: string }): Promise<GifTrendingCategory[]> {
        return await this.#trendingCategoryCache.getOrUpdate(async () => {
            // query.media_format ??= "gif";
            query.locale ??= "en";
            const response = await fetch(`https://api.klipy.com/api/v1/${this.#apiKey}/gifs/categories?locale=${query.locale}`, {
                method: "get",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) console.log(response, await response.text());
            const responseData = (await response.json()) as KlipyCategoriesResponse;
            return responseData.data.categories.map((x) => ({
                name: x.query,
                src: x.preview_url,
            })) satisfies GifTrendingCategory[];
        });
    }

    async getTrendingGifs(query: { media_format: string; locale: string }): Promise<GifsResponse> {
        return await this.#trendingGifsCache.getOrUpdate(async () => {
            // query.media_format ??= "gif";
            query.locale ??= "en";
            const response = await fetch(`https://api.klipy.com/api/v1/${this.#apiKey}/gifs/trending?locale=${query.locale}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) console.log(response, await response.text());
            const responseData = (await response.json()) as KlipyGifsResponse;
            return responseData.data.data.map(this.convertGifResult);
        });
    }

    private convertGifResult(result: KlipyMediaItem) {
        return {
            id: result.id.toString(),
            title: result.title,
            url: result.slug, //?
            src: result.file.hd.mp4.url,
            gif_src: result.file.hd.gif.url,
            width: result.file.hd.gif.width,
            height: result.file.hd.gif.height,
            preview: result.file.hd.gif.url,
        } satisfies GifResponse;
    }
}

// API response types

interface KlipyCategoriesResponse {
    result: boolean;
    data: { locale: string; categories: KlipyCategory[] };
}

interface KlipyCategory {
    category: string;
    query: string;
    preview_url: string;
}

interface KlipyGifsResponse {
    result: boolean;
    data: { current_page: number; per_page: number; has_next: boolean; data: KlipyMediaItem[] };
}

interface KlipyMediaItem {
    id: number;
    slug: string;
    title: string;
    file: KlipyFile;
    tags: string[];
    type: string;
    blur_preview: string;
}

interface KlipyFile {
    hd: KlipyFileSize;
    md: KlipyFileSize;
    sm: KlipyFileSize;
    xs: KlipyFileSize;
}

interface KlipyFileSize {
    gif: KlipyFileInfo;
    webp: KlipyFileInfo;
    jpg: KlipyFileInfo;
    mp4: KlipyFileInfo;
    webm: KlipyFileInfo;
}

interface KlipyFileInfo {
    url: string;
    width: number;
    height: number;
    size: number;
}
