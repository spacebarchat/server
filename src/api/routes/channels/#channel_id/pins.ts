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
	ChannelPinsUpdateEvent,
	Config,
	DiscordApiErrors,
	emitEvent,
	Message,
	MessageCreateEvent,
	MessageUpdateEvent,
	User,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.put(
	"/:message_id",
	route({
		permission: "VIEW_CHANNEL",
		responses: {
			204: {},
			403: {},
			404: {},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, message_id } = req.params;

		const message = await Message.findOneOrFail({
			where: { id: message_id },
		});

		// * in dm channels anyone can pin messages -> only check for guilds
		if (message.guild_id) req.permission?.hasThrow("MANAGE_MESSAGES");

		const pinned_count = await Message.count({
			where: { channel: { id: channel_id }, pinned: true },
		});
		const { maxPins } = Config.get().limits.channel;
		if (pinned_count >= maxPins)
			throw DiscordApiErrors.MAXIMUM_PINS.withParams(maxPins);

		message.pinned = true;

		const author = await User.getPublicUser(req.user_id);

		const systemPinMessage = Message.create({
			timestamp: new Date(),
			type: 6,
			guild_id: message.guild_id,
			channel_id: message.channel_id,
			author,
			message_reference: {
				message_id: message.id,
				channel_id: message.channel_id,
				guild_id: message.guild_id,
			},
			reactions: [],
			attachments: [],
			embeds: [],
			sticker_items: [],
			edited_timestamp: undefined,
			mentions: [],
			mention_channels: [],
			mention_roles: [],
			mention_everyone: false,
		});

		await Promise.all([
			message.save(),
			emitEvent({
				event: "MESSAGE_UPDATE",
				channel_id,
				data: message,
			} as MessageUpdateEvent),
			emitEvent({
				event: "CHANNEL_PINS_UPDATE",
				channel_id,
				data: {
					channel_id,
					guild_id: message.guild_id,
					last_pin_timestamp: undefined,
				},
			} as ChannelPinsUpdateEvent),
			systemPinMessage.save(),
			emitEvent({
				event: "MESSAGE_CREATE",
				channel_id: message.channel_id,
				data: systemPinMessage,
			} as MessageCreateEvent),
		]);

		res.sendStatus(204);
	},
);

router.delete(
	"/:message_id",
	route({
		permission: "VIEW_CHANNEL",
		responses: {
			204: {},
			403: {},
			404: {},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, message_id } = req.params;

		const message = await Message.findOneOrFail({
			where: { id: message_id },
		});

		if (message.guild_id) req.permission?.hasThrow("MANAGE_MESSAGES");

		message.pinned = false;

		await Promise.all([
			message.save(),
			emitEvent({
				event: "MESSAGE_UPDATE",
				channel_id,
				data: message,
			} as MessageUpdateEvent),
			emitEvent({
				event: "CHANNEL_PINS_UPDATE",
				channel_id,
				data: {
					channel_id,
					guild_id: message.guild_id,
					last_pin_timestamp: undefined,
				},
			} as ChannelPinsUpdateEvent),
		]);

		res.sendStatus(204);
	},
);

router.get(
	"/",
	route({
		permission: ["READ_MESSAGE_HISTORY"],
		responses: {
			200: {
				body: "APIMessageArray",
			},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;

		const pins = await Message.find({
			where: { channel_id: channel_id, pinned: true },
			relations: ["author"],
		});

		res.send(pins);
	},
);

export default router;
