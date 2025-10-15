/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { route } from "@spacebar/api";
import {
	getGifApiKey,
	parseGifResult,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import fetch from "node-fetch-commonjs";
import { ProxyAgent } from "proxy-agent";
import http from "http";
import { TenorGif, TenorMediaTypes } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		query: {
			media_format: {
				type: "string",
				description: "Media format",
				values: Object.keys(TenorMediaTypes).filter((key) =>
					isNaN(Number(key)),
				),
			},
			locale: {
				type: "string",
				description: "Locale",
			},
		},
		responses: {
			200: {
				body: "TenorGifsResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// TODO: Custom providers
		const { media_format, locale } = req.query;

		const apiKey = getGifApiKey();

		const agent = new ProxyAgent();

		const response = await fetch(
			`https://g.tenor.com/v1/trending?media_format=${media_format}&locale=${locale}&key=${apiKey}`,
			{
				agent: agent as http.Agent,
				method: "get",
				headers: { "Content-Type": "application/json" },
			},
		);

		const { results } = (await response.json()) as { results: TenorGif[] };

		res.json(results.map(parseGifResult)).status(200);
	},
);

export default router;
