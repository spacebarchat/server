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
import { Channel, ChannelRecipientAddEvent, DiscordApiErrors, DmChannelDTO, emitEvent, Recipient, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { ChannelType, PublicUserProjection } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.put(
	"/:user_id",
	route({
		responses: {
			201: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, user_id } = req.params;
		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
			relations: ["recipients"],
		});

		if (channel.type !== ChannelType.GROUP_DM) {
			const recipients = [...new Set([...(channel.recipients?.map((r) => r.user_id) || []), user_id])];

			const new_channel = await Channel.createDMChannel(recipients, req.user_id);
			return res.status(201).json(new_channel);
		} else {
			if (channel.recipients?.map((r) => r.user_id).includes(user_id)) {
				throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
			}

			channel.recipients?.push(Recipient.create({ channel_id: channel_id, user_id: user_id }));
			await channel.save();

			await emitEvent({
				event: "CHANNEL_CREATE",
				data: await DmChannelDTO.from(channel, [user_id]),
				user_id: user_id,
			});

			await emitEvent({
				event: "CHANNEL_RECIPIENT_ADD",
				data: {
					channel_id: channel_id,
					user: await User.findOneOrFail({
						where: { id: user_id },
						select: PublicUserProjection,
					}),
				},
				channel_id: channel_id,
			} as ChannelRecipientAddEvent);
			return res.sendStatus(204);
		}
	},
);

router.delete(
	"/:user_id",
	route({
		responses: {
			204: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, user_id } = req.params;
		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
			relations: ["recipients"],
		});
		if (!(channel.type === ChannelType.GROUP_DM && (channel.owner_id === req.user_id || user_id === req.user_id))) throw DiscordApiErrors.MISSING_PERMISSIONS;

		if (!channel.recipients?.map((r) => r.user_id).includes(user_id)) {
			throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
		}

		await Channel.removeRecipientFromChannel(channel, user_id);

		return res.sendStatus(204);
	},
);

export default router;
