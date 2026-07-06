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

import type { IGifProvider } from "../IGifProvider";
import { GifsResponse, GifTrendingCategory, GifMediaTypes } from "@spacebar/schemas";
import { Config } from "@spacebar/util";

// Tenor V1 API... Not yet shut down as of writing, but is going soon...
export default class TenorGifProvider implements IGifProvider {
    id = "tenor";
    available = true;
    #apiKey: string;

    async init(): Promise<void> {
        if (!(Config.get().gif.enabled && Config.get().gif.apiKey)) {
            this.available = false;
            return;
        }

        this.#apiKey = Config.get().gif.apiKey!;
        console.log("[TenorGifProvider] Hellorld!");
    }

    async search(query: { q: string; limit?: number; media_format: string; locale: string }): Promise<GifsResponse> {
        const response = await fetch(`https://g.tenor.com/v1/search?q=${query.q}&media_format=${query.media_format}&locale=${query.locale}&key=${this.#apiKey}`, {
            method: "get",
            headers: { "Content-Type": "application/json" },
        });

        const responseData = (await response.json()) as TenorSearchResults;
        return responseData.results.map(this.convertGifResult);
    }

    async getTrendingCategories(query: { media_format: string; locale: string }): Promise<GifTrendingCategory[]> {
        const response = await fetch(`https://g.tenor.com/v1/categories?locale=${query.locale}&key=${this.#apiKey}`, {
            method: "get",
            headers: { "Content-Type": "application/json" },
        });

        const responseData = (await response.json()) as TenorCategoriesResults;
        return responseData.tags.map((x) => ({
            name: x.searchterm,
            src: x.image,
        })) satisfies GifTrendingCategory[];
    }

    async getTrendingGifs(query: { media_format: string; locale: string }): Promise<GifsResponse> {
        const response = await fetch(`https://g.tenor.com/v1/trending?media_format=${query.media_format}&locale=${query.locale}&key=${this.#apiKey}`, {
            method: "get",
            headers: { "Content-Type": "application/json" },
        });

        const responseData = (await response.json()) as TenorTrendingResults;
        return responseData.results.map(this.convertGifResult);
    }

    private convertGifResult(result: TenorGif) {
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
}

// API response types

type TenorGif = {
    created: number;
    hasaudio: boolean;
    id: string;
    media: { [type in keyof typeof GifMediaTypes]: TenorMedia }[];
    tags: string[];
    title: string;
    itemurl: string;
    hascaption: boolean;
    url: string;
};

type TenorMedia = {
    preview: string;
    url: string;
    dims: number[];
    size: number;
};

type TenorCategory = {
    searchterm: string;
    path: string;
    image: string;
    name: string;
};

type TenorCategoriesResults = {
    tags: TenorCategory[];
};

type TenorTrendingResults = {
    next: string;
    results: TenorGif[];
    locale: string;
};

type TenorSearchResults = {
    next: string;
    results: TenorGif[];
};
