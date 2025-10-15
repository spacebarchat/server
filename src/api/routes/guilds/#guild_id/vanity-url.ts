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
	Channel,
	ChannelType,
	Guild,
	Invite,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { VanityUrlSchema } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

const InviteRegex = /\W/g;

router.get(
	"/",
	route({
		permission: "MANAGE_GUILD",
		responses: {
			200: {
				body: "GuildVanityUrlResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const guild = await Guild.findOneOrFail({ where: { id: guild_id } });

		if (!guild.features.includes("ALIASABLE_NAMES")) {
			const invite = await Invite.findOne({
				where: { guild_id: guild_id, vanity_url: true },
			});
			if (!invite) return res.json({ code: null });

			return res.json({ code: invite.code, uses: invite.uses });
		} else {
			const invite = await Invite.find({
				where: { guild_id: guild_id, vanity_url: true },
			});
			if (!invite || invite.length == 0) return res.json({ code: null });

			return res.json(
				invite.map((x) => ({ code: x.code, uses: x.uses })),
			);
		}
	},
);

router.patch(
	"/",
	route({
		requestBody: "VanityUrlSchema",
		permission: "MANAGE_GUILD",
		responses: {
			200: {
				body: "GuildVanityUrlCreateResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const body = req.body as VanityUrlSchema;
		const code = body.code?.replace(InviteRegex, "");

		const guild = await Guild.findOneOrFail({ where: { id: guild_id } });
		if (!guild.features.includes("VANITY_URL"))
			throw new HTTPError("Your guild doesn't support vanity urls");

		if (!code || code.length === 0)
			throw new HTTPError("Code cannot be null or empty");

		const invite = await Invite.findOne({ where: { code } });
		if (invite) throw new HTTPError("Invite already exists");

		const { id } = await Channel.findOneOrFail({
			where: { guild_id, type: ChannelType.GUILD_TEXT },
		});

		if (!guild.features.includes("ALIASABLE_NAMES")) {
			await Invite.delete({ guild_id, vanity_url: true });
		}

		await Invite.create({
			vanity_url: true,
			code,
			temporary: false,
			uses: 0,
			max_uses: 0,
			max_age: 0,
			created_at: new Date(),
			guild_id: guild_id,
			channel_id: id,
			flags: 0,
		}).save();

		return res.json({ code });
	},
);

export default router;
