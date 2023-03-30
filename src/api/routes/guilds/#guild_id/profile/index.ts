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

import { route } from "@fosscord/api";
import {
	emitEvent,
	GuildMemberUpdateEvent,
	handleFile,
	Member,
	MemberChangeProfileSchema,
	OrmUtils,
} from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.patch(
	"/:member_id",
	route({ body: "MemberChangeProfileSchema" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		// const member_id =
		// 	req.params.member_id === "@me" ? req.user_id : req.params.member_id;
		const body = req.body as MemberChangeProfileSchema;

		let member = await Member.findOneOrFail({
			where: { id: req.user_id, guild_id },
			relations: ["roles", "user"],
		});

		if (body.banner)
			body.banner = await handleFile(
				`/guilds/${guild_id}/users/${req.user_id}/avatars`,
				body.banner as string,
			);

		member = await OrmUtils.mergeDeep(member, body);

		await member.save();

		// do not use promise.all as we have to first write to db before emitting the event to catch errors
		await emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			guild_id,
			data: { ...member, roles: member.roles.map((x) => x.id) },
		} as GuildMemberUpdateEvent);

		res.json(member);
	},
);

export default router;
