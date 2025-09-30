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
	emitEvent,
	getPermission,
	MessageAckEvent,
	ReadState,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

// TODO: public read receipts & privacy scoping
// TODO: send read state event to all channel members
// TODO: advance-only notification cursor

router.post(
	"/",
	route({
		requestBody: "MessageAcknowledgeSchema",
		responses: {
			200: {},
			403: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, message_id } = req.params;

		const permission = await getPermission(
			req.user_id,
			undefined,
			channel_id,
		);
		permission.hasThrow("VIEW_CHANNEL");

		let read_state = await ReadState.findOne({
			where: { user_id: req.user_id, channel_id },
		});
		if (!read_state)
			read_state = ReadState.create({ user_id: req.user_id, channel_id });
		read_state.last_message_id = message_id;

		await read_state.save();

		await emitEvent({
			event: "MESSAGE_ACK",
			user_id: req.user_id,
			data: {
				channel_id,
				message_id,
				version: 3763,
			},
		} as MessageAckEvent);

		res.json({ token: null });
	},
);

export default router;
