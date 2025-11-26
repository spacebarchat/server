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
import { User, UserSettings } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { UserSettingsUpdateSchema, UserSettingsSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "UserSettings",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const settings = await UserSettings.getOrDefault(req.user_id);
		return res.json(settings);
	},
);

router.patch(
	"/",
	route({
		requestBody: "UserSettingsUpdateSchema",
		responses: {
			200: {
				body: "UserSettings",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as UserSettingsUpdateSchema;
		if (!body) return res.status(400).json({ code: 400, message: "Invalid request body" });
		if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unknown locale

		const user = await User.findOneOrFail({
			where: { id: req.user_id, bot: false },
			relations: ["settings"],
		});

		if (!user.settings) user.settings = UserSettings.create<UserSettings>(body);
		else user.settings.assign(body);

		if (body.guild_folders) user.settings.guild_folders = body.guild_folders;

		await user.settings.save();
		await user.save();

		res.json({ ...user.settings, index: undefined });
	},
);

export default router;
