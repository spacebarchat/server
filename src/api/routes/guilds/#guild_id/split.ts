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
	PublicMemberProjection,
	GuildCreateSchema,
	ChannelTypes,
} from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { route } from "@spacebar/api";
import { getModeForResolutionAtIndex } from "typescript";
import { chmodSync } from "node:fs";

const router = Router();

router.post(
	"/",
	route({ body: "GuildCreateSchema", right: "CREATE_GUILDS" }),
	async (req: Request, res: Response) => {
		// create a new guild with the channels that are in the guild
	
		const body = req.body as GuildCreateSchema;

		const { maxGuilds } = Config.get().limits.user;
		
		// splits are not subject to guild count limits
		const rights = await getRights(req.user_id);
		rights.hasThrow("SELF_EDIT_MESSAGES");
		rights.hasThrow("SEND_MESSAGES");
		
		const guild = await Guild.findOneOrFail({
		where: { id: req.params.guild_id },
		select: ["owner_id"],
		});
		
		// dangerous stuff - owners only
		if (guild.owner_id !== req.user_id)
		throw new HTTPError("You are not the owner of this guild", 401);
				
		/**
		 partially addresses fishvap's concerns on buyout schemes
		 by disallowing splitting away empty guilds
		**/
		if (!(body.channels) || (body.channels.length < 1))
		throw new HTTPError("One or more channels required", 403);

		/** 
		 point of no return
		 no permission errors may be thrown from here below
		**/

		// remove channels from old guild
		guild.channels = guild.channels.filter (ch => !(body.channels?.includes(ch)));

		/** 
		create the guild we're placing the channels into
		use the name and icon supplied by the request if it's supplied in the body
		otherwise take them from the old guild 
		**/
		const guild_new = await Guild.createGuild({
			...guild,
			name: body.name ? body.name : guild.name,
			icon: body.icon ? body.icon: guild.icon,
			channels: body.channels,
			owner_id: req.user_id,
		});

		// copy general settings over to the new guild
		guild_new.features = guild.features;
		guild_new.preferred_locale = guild.preferred_locale;
		guild_new.system_channel_flags = 4;
		guild_new.mfa_level = guild.mfa_level;
		guild_new.nsfw_level = guild.nsfw_level;

		// trim parents from outside the guild to prevent possible client crashes
		const chs = body.channels?.filter(ch => body.channels?.map(par => par.id).includes(ch.parent_id));
		chs?.forEach(x => x.parent_id = undefined);

		// commit changes — the order is important to prevent authorisation conflicts
		guild.save();
		guild_new.save();
		
		// create new guild's roles
		const roles = await Role.find({ where: { guild_id: guild.id } });

		// join all members of the old guild into the newly created one		
		const members  = await Member.find({
			where: { guild_id: guild.id },
			select: PublicMemberProjection,
			order: { id: "ASC" },
		});

		for (const u of members) {
			await Member.addToGuild(u.user.id, guild_new.id);
		}

		// assign new guild's roles along with all those roles

		const R = roles.filter(role => role.id != guild.id);

		for (const role of R) {
			const r = await Role.create({...role, guild_id: guild_new.id}).save();
			for (const u of members) await Member.addRole(u.user.id, guild_new.id, r.id);
		}
		
		return res.status(201).json(guild_new);

	},
);

export default router;

