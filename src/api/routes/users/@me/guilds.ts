/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
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

import { Router, Request, Response } from "express";
import {
	Guild,
	Member,
	User,
	GuildDeleteEvent,
	GuildMemberRemoveEvent,
	emitEvent,
	Config,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const members = await Member.find({
		relations: ["guild"],
		where: { id: req.user_id },
	});

	let guild = members.map((x) => x.guild);

	if ("with_counts" in req.query && req.query.with_counts == "true") {
		guild = []; // TODO: Load guilds with user role permissions number
	}

	res.json(guild);
});

// user send to leave a certain guild
router.delete("/:guild_id", route({}), async (req: Request, res: Response) => {
	const { autoJoin } = Config.get().guild;
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({
		where: { id: guild_id },
		select: ["owner_id"],
	});

	if (!guild) throw new HTTPError("Guild doesn't exist", 404);
	if (guild.owner_id === req.user_id)
		throw new HTTPError("You can't leave your own guild", 400);
	if (
		autoJoin.enabled &&
		autoJoin.guilds.includes(guild_id) &&
		!autoJoin.canLeave
	) {
		throw new HTTPError("You can't leave instance auto join guilds", 400);
	}

	await Promise.all([
		Member.delete({ id: req.user_id, guild_id: guild_id }),
		emitEvent({
			event: "GUILD_DELETE",
			data: {
				id: guild_id,
			},
			user_id: req.user_id,
		} as GuildDeleteEvent),
	]);

	const user = await User.getPublicUser(req.user_id);

	await emitEvent({
		event: "GUILD_MEMBER_REMOVE",
		data: {
			guild_id: guild_id,
			user: user,
		},
		guild_id: guild_id,
	} as GuildMemberRemoveEvent);

	return res.sendStatus(204);
});

export default router;
