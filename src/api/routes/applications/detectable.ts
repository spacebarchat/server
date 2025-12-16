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
import { Request, Response, Router } from "express";
import { ApplicationDetectableResponse } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });
const cache = {
	data: {},
	expires: 0
}

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "ApplicationDetectableResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// cache for 6 hours
		if (Date.now() > cache.expires) {
			const response = await fetch("https://discord.com/api/v10/games/detectable"); // because, well, it's unauthenticated anyways
			const data = await response.json();
			cache.data = data as ApplicationDetectableResponse;
			cache.expires = Date.now() + 6 * 60 * 60 * 1000;
		}

		res.set("Cache-Control", `public, max-age=${Math.floor((cache.expires - Date.now()) / 1000)}, s-maxage=${Math.floor((cache.expires - Date.now()) / 1000)}, immutable`)
			.status(200)
			.json(cache.data);
	},
);

export default router;
