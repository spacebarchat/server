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
	ChannelUpdateEvent,
	emitEvent,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
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

		await Promise.all([
			body.map(async (x) => {
				if (x.position == null && !x.parent_id)
					throw new HTTPError(
						`You need to at least specify position or parent_id`,
						400,
					);

				const opts: Partial<Channel> = {};
				if (x.position != null) opts.position = x.position;

				if (x.parent_id) {
					opts.parent_id = x.parent_id;
					const parent_channel = await Channel.findOneOrFail({
						where: { id: x.parent_id, guild_id },
						select: ["permission_overwrites"],
					});
					if (x.lock_permissions) {
						opts.permission_overwrites =
							parent_channel.permission_overwrites;
					}
				}

				await Channel.update({ guild_id, id: x.id }, opts);
				const channel = await Channel.findOneOrFail({
					where: { guild_id, id: x.id },
				});

				await emitEvent({
					event: "CHANNEL_UPDATE",
					data: channel,
					channel_id: x.id,
					guild_id,
				} as ChannelUpdateEvent);
			}),
		]);

		res.sendStatus(204);
	},
);

export default router;
