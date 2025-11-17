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
import { Channel, emitEvent, Message, MessageCreateEvent, Permissions, Sticker } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { In } from "typeorm";
import { GreetRequestSchema, MessageType } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		requestBody: "GreetRequestSchema",
		permission: "SEND_MESSAGES",
		responses: {
			200: {
				body: "Message",
			},
			404: {},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const payload = req.body as GreetRequestSchema;
		const { channel_id } = req.params;

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});

		const targetMessage = await Message.findOneOrFail({
			where: {
				id: payload.message_reference?.message_id,
				channel_id: payload.message_reference?.channel_id,
				guild_id: payload.message_reference?.guild_id,
			},
		});

		if (!channel.isDm() && targetMessage.type != MessageType.GUILD_MEMBER_JOIN)
			return res.status(400).json({
				code: 400, // TODO: what's the actual error code?
				message: "Cannot send greet message referencing this message.",
			});

		if (!(await channel.getUserPermissions({ user_id: req.user_id })).has(Permissions.FLAGS.SEND_MESSAGES)) {
			return res.status(403).json({
				code: 403,
				message: "Missing Permissions: SEND_MESSAGES",
			});
		}

		const specCompliant = true; // incase we want to allow clients to add more than one sticker to pick
		if (specCompliant && payload.sticker_ids.length != 1)
			return res.status(400).json({
				code: 400,
				message: "Must include exactly one sticker.",
			});

		const stickers = await Sticker.find({ where: { id: In(payload.sticker_ids) } });

		const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

		const message = Message.create({
			channel_id: channel_id,
			author_id: req.user_id,
			type: MessageType.REPLY,
			message_reference: { ...payload.message_reference, type: 0 },
			referenced_message: targetMessage,
			sticker_items: randomSticker ? [{ id: randomSticker.id, name: randomSticker.name, format_type: randomSticker.format_type }] : [],
		});

		await Promise.all([
			message.save(),
			emitEvent({
				event: "MESSAGE_CREATE",
				data: message,
				channel_id,
			} as MessageCreateEvent),
		]);

		res.send(message);
	},
);

export default router;
