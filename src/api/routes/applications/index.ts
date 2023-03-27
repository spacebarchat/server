/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import {
	Application,
	ApplicationCreateSchema,
	trimSpecial,
	User,
} from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "APIApplicationArray",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const results = await Application.find({
			where: { owner: { id: req.user_id } },
			relations: ["owner", "bot"],
		});
		res.json(results).status(200);
	},
);

router.post(
	"/",
	route({
		requestBody: "ApplicationCreateSchema",
		responses: {
			200: {
				body: "Application",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as ApplicationCreateSchema;
		const user = await User.findOneOrFail({ where: { id: req.user_id } });

		const app = Application.create({
			name: trimSpecial(body.name),
			description: "",
			bot_public: true,
			owner: user,
			verify_key: "IMPLEMENTME",
			flags: 0,
		});

		await app.save();

		res.json(app);
	},
);

export default router;
