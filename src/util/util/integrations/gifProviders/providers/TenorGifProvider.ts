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
import { TenorGif, GifsResponse } from "@spacebar/schemas";
import { Config, getGifApiKey, parseGifResult } from "@spacebar/util";

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

        const { results } = (await response.json()) as { results: TenorGif[] };
        return results.map(parseGifResult);
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
