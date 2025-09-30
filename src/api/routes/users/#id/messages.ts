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
import { Config, DmMessagesResponseSchema, Message, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "DmMessagesResponseSchema",
			},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({ where: { id: req.params.id } });
		const channel = await user.getDmChannelWith(req.user_id);

		const messages = (
			await Message.find({
				where: { channel_id: channel?.id },
				order: { timestamp: "DESC" },
				take: Math.clamp(req.query.limit ? Number(req.query.limit) : 50, 1, Config.get().limits.message.maxPreloadCount),
			})
		).filter((x) => x !== null) as Message[];

		const filteredMessages = messages.map((message) => message.toPartialMessage()) as DmMessagesResponseSchema;

		return res.status(200).send(filteredMessages);
	},
);

// TODO: POST to send a message to the user

export default router;
