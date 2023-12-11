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

import {
	Channel,
	ChannelPermissionOverwrite,
	ChannelPermissionOverwriteSchema,
	ChannelUpdateEvent,
	emitEvent,
	Member,
	Role,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

import { route } from "@spacebar/api";
const router: Router = Router();

// TODO: Only permissions your bot has in the guild or channel can be allowed/denied (unless your bot has a MANAGE_ROLES overwrite in the channel)

router.put(
	"/:overwrite_id",
	route({
		requestBody: "ChannelPermissionOverwriteSchema",
		permission: "MANAGE_ROLES",
		responses: {
			204: {},
			404: {},
			501: {},
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id, overwrite_id } = req.params;
		const body = req.body as ChannelPermissionOverwriteSchema;

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});
		if (!channel.guild_id) throw new HTTPError("Channel not found", 404);

		if (body.type === 0) {
			if (!(await Role.count({ where: { id: overwrite_id } }))) throw new HTTPError("role not found", 404);
		} else if (body.type === 1) {
			if (!(await Member.count({ where: { id: overwrite_id } }))) throw new HTTPError("user not found", 404);
		} else throw new HTTPError("type not supported", 501);

		let overwrite: ChannelPermissionOverwrite | undefined = channel.permission_overwrites?.find(
			(x) => x.id === overwrite_id
		);
		if (!overwrite) {
			overwrite = {
				id: overwrite_id,
				type: body.type,
				allow: "0",
				deny: "0",
			};
			channel.permission_overwrites?.push(overwrite);
		}
		overwrite.allow = String((req.permission?.bitfield || 0n) & (BigInt(body.allow) || BigInt("0")));
		overwrite.deny = String((req.permission?.bitfield || 0n) & (BigInt(body.deny) || BigInt("0")));

		await Promise.all([
			channel.save(),
			emitEvent({
				event: "CHANNEL_UPDATE",
				channel_id,
				data: channel,
			} as ChannelUpdateEvent),
		]);

		return res.sendStatus(204);
	}
);

// TODO: check permission hierarchy
router.delete(
	"/:overwrite_id",
	route({ permission: "MANAGE_ROLES", responses: { 204: {}, 404: {} } }),
	async (req: Request, res: Response) => {
		const { channel_id, overwrite_id } = req.params;

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});
		if (!channel.guild_id) throw new HTTPError("Channel not found", 404);

		channel.permission_overwrites = channel.permission_overwrites?.filter((x) => x.id === overwrite_id);

		await Promise.all([
			channel.save(),
			emitEvent({
				event: "CHANNEL_UPDATE",
				channel_id,
				data: channel,
			} as ChannelUpdateEvent),
		]);

		return res.sendStatus(204);
	}
);

export default router;
