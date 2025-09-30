/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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
import { CollectiblesMarketingResponse } from "@spacebar/util";

const router = Router({ mergeParams: true });

// Unsure what this endpoint does, it seems to only affect the visual style of the shop tab in home
router.get(
	"/",
	route({
		responses: {
			200: {
				body: "CollectiblesMarketingResponse",
			},
			204: {},
			401: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		res.send({
			marketings: {},
		} as CollectiblesMarketingResponse);
	},
);

export default router;
