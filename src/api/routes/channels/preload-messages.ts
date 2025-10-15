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
import { Config, Message } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { PreloadMessagesRequestSchema, PreloadMessagesResponseSchema } from "@spacebar/schemas"
const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		requestBody: "PreloadMessagesRequestSchema",
		responses: {
			200: {
				body: "PreloadMessagesResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as PreloadMessagesRequestSchema;
		if (body.channels.length > Config.get().limits.message.maxPreloadCount)
			return res.status(400).send({
				code: 400,
				message: `Cannot preload more than ${Config.get().limits.message.maxPreloadCount} channels at once.`,
			});

		const messages = (
			await Promise.all(
				body.channels.map(
					async (channelId) =>
						await Message.findOne({
							where: { channel_id: channelId },
							order: { timestamp: "DESC" },
						}),
				),
			)
		).filter((x) => x !== null) as Message[];

		const filteredMessages = messages.map((message) => {
			const x = message.toJSON();
			// https://docs.discord.food/resources/message#preload-messages - reactions are not included in the response
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			x.reactions = undefined;
			return x;
		}) as PreloadMessagesResponseSchema;

		return res.status(200).send(filteredMessages);
	},
);

export default router;
