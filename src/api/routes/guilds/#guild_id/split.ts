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
	ChannelReorderSchema,
	Member,
	Role,
	Guild,
	getRights,
	Config,
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

		// TODO: join all members of the old guild into the newly created one
		
		
	},
);

export default router;

