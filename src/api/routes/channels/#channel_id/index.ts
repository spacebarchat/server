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

import {
	Channel,
	ChannelDeleteEvent,
	ChannelType,
	ChannelUpdateEvent,
	emitEvent,
	Recipient,
	handleFile,
	ChannelModifySchema,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.get(
	"/",
	route({ permission: "VIEW_CHANNEL" }),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});

		return res.send(channel);
	},
);

router.delete(
	"/",
	route({ permission: "MANAGE_CHANNELS" }),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
			relations: ["recipients"],
		});

		if (channel.type === ChannelType.DM) {
			const recipient = await Recipient.findOneOrFail({
				where: { channel_id: channel_id, user_id: req.user_id },
			});
			recipient.closed = true;
			await Promise.all([
				recipient.save(),
				emitEvent({
					event: "CHANNEL_DELETE",
					data: channel,
					user_id: req.user_id,
				} as ChannelDeleteEvent),
			]);
		} else if (channel.type === ChannelType.GROUP_DM) {
			await Channel.removeRecipientFromChannel(channel, req.user_id);
		} else {
			await Promise.all([
				Channel.delete({ id: channel_id }),
				emitEvent({
					event: "CHANNEL_DELETE",
					data: channel,
					channel_id,
				} as ChannelDeleteEvent),
			]);
		}

		res.send(channel);
	},
);

router.patch(
	"/",
	route({ body: "ChannelModifySchema", permission: "MANAGE_CHANNELS" }),
	async (req: Request, res: Response) => {
		const payload = req.body as ChannelModifySchema;
		const { channel_id } = req.params;
		if (payload.icon)
			payload.icon = await handleFile(
				`/channel-icons/${channel_id}`,
				payload.icon,
			);

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});
		channel.assign(payload);

		await Promise.all([
			channel.save(),
			emitEvent({
				event: "CHANNEL_UPDATE",
				data: channel,
				channel_id,
			} as ChannelUpdateEvent),
		]);

		res.send(channel);
	},
);

export default router;
