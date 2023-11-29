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
	ChannelModifySchema,
	ChannelReorderSchema,
	Guild,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get(
	"/",
	route({
		responses: {
			201: {
				body: "APIChannelArray",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const channels = await Channel.find({ where: { guild_id } });

		res.json(channels);
	},
);

router.post(
	"/",
	route({
		requestBody: "ChannelModifySchema",
		permission: "MANAGE_CHANNELS",
		responses: {
			201: {
				body: "Channel",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// creates a new guild channel https://discord.com/developers/docs/resources/guild#create-guild-channel
		const { guild_id } = req.params;
		const body = req.body as ChannelModifySchema;

		const channel = await Channel.createChannel(
			{ ...body, guild_id },
			req.user_id,
		);

		res.status(201).json(channel);
	},
);

router.patch(
	"/",
	route({
		requestBody: "ChannelReorderSchema",
		permission: "MANAGE_CHANNELS",
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// changes guild channel position
		const { guild_id } = req.params;
		const body = req.body as ChannelReorderSchema;

		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			select: { channel_ordering: true },
		});

		// The channels not listed for this query
		const notMentioned = guild.channel_ordering.filter(
			(x) => !body.find((c) => c.id == x),
		);

		await Guild.update(
			{ id: guild_id },
			{ channel_ordering: notMentioned },
		);

		return res.sendStatus(204);
	},
);

export default router;
