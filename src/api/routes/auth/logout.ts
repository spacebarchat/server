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

const router: Router = Router({ mergeParams: true });
export default router;

router.post(
	"/",
	route({
		responses: {
			204: {},
		},
	}),
	async (req: Request, res: Response) => {
		if (req.body.provider != null || req.body.voip_provider != null) {
			console.log(
				`[LOGOUT]: provider or voip provider not null!`,
				req.body,
			);
		} else {
			delete req.body.provider;
			delete req.body.voip_provider;
			if (Object.keys(req.body).length != 0)
				console.log(`[LOGOUT]: Extra fields sent in logout!`, req.body);
		}
		res.status(204).send();
	},
);
