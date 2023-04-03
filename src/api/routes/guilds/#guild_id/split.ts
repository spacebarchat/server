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

import { Router, Response, Request } from "express";
import {
	Channel,
	ChannelUpdateEvent,
	emitEvent,
	ChannelModifySchema,
	GuildSplitAndMergeSchema,
} from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { route } from "@spacebar/api";
const router = Router();

router.post(
	"/",
	route({ body: "ChannelModifySchema", right: "CREATE_GUILDS" }),
	async (req: Request, res: Response) => {
		// create a new guild with the channels that are in the guild
	
		const body = req.body as ChannelModifySchema;

		const { maxGuilds } = Config.get().limits.user;
		
		// splits are not subject to guild count limits
		const rights = await getRights(req.user_id);
		
		const guild = await Guild.findOneOrFail({
		where: { id: req.params.guild_id },
		select: ["owner_id"],
		});
		
		if (guild.owner_id !== req.user_id)
		throw new HTTPError("You are not the owner of this guild", 401);
		
		// remove channels from old guild

		guild.channels = guild.channels.filter (item => !req.body.channels.includes(item));
		
		// create new guild's roles
		
		const roles = await Role.find({ where: { guild_id: guild.id } });
		
		const guild_new = await Guild.createGuild({
			...guild,
			channels: req.body.channels,
			owner_id: req.user_id,
		});

		// join all members of the old guild into the newly created one
		
		const members = await Member.find({
		where: { guild.id, ...query },
		select: PublicMemberProjection,
		order: { id: "ASC" },
		});

		for (member in members) {
			await Member.addToGuild(member.user.id, guild_new.id);
		}
		res.status(201).json({ id: guild.id });
	},
);

router.patch(
	"/",
	route({ body: "ChannelReorderSchema", permission: "MANAGE_CHANNELS" }),
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
