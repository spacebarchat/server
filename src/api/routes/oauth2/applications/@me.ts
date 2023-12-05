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
	Application,
	DiscordApiErrors,
	PublicUserProjection,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "Application",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const app = await Application.findOneOrFail({
			where: { id: req.params.id },
			relations: ["bot", "owner"],
			select: {
				owner: Object.fromEntries(
					PublicUserProjection.map((x) => [x, true]),
				),
			},
		});

		if (!app.bot) throw DiscordApiErrors.BOT_ONLY_ENDPOINT;

		res.json({
			...app,
			owner: app.owner.toPublicUser(),
			install_params:
				app.install_params !== null ? app.install_params : undefined,
		});
	},
);
export default router;
