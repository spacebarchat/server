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

import { Request, Response, Router } from "express";
import {
	Member,
	getPermission,
	getRights,
	Role,
	GuildMemberUpdateEvent,
	emitEvent,
	Sticker,
	Emoji,
	Guild,
	handleFile,
	MemberChangeSchema,
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const member = await Member.findOneOrFail({
		where: { id: member_id, guild_id },
	});

	return res.json(member);
});

router.patch(
	"/",
	route({ body: "MemberChangeSchema" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const member_id =
			req.params.member_id === "@me" ? req.user_id : req.params.member_id;
		const body = req.body as MemberChangeSchema;

		const member = await Member.findOneOrFail({
			where: { id: member_id, guild_id },
			relations: ["roles", "user"],
		});
		const permission = await getPermission(req.user_id, guild_id);
		const everyone = await Role.findOneOrFail({
			where: { guild_id: guild_id, name: "@everyone", position: 0 },
		});

		if (body.avatar)
			body.avatar = await handleFile(
				`/guilds/${guild_id}/users/${member_id}/avatars`,
				body.avatar as string,
			);

		member.assign(body);

		if ("roles" in body) {
			permission.hasThrow("MANAGE_ROLES");

			body.roles = body.roles || [];
			body.roles.filter((x) => !!x);

			if (body.roles.indexOf(everyone.id) === -1)
				body.roles.push(everyone.id);
			member.roles = body.roles.map((x) => Role.create({ id: x })); // foreign key constraint will fail if role doesn't exist
		}

		await member.save();

		member.roles = member.roles.filter((x) => x.id !== everyone.id);

		// do not use promise.all as we have to first write to db before emitting the event to catch errors
		await emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			guild_id,
			data: { ...member, roles: member.roles.map((x) => x.id) },
		} as GuildMemberUpdateEvent);

		res.json(member);
	},
);

router.put("/", route({}), async (req: Request, res: Response) => {
	// TODO: Lurker mode

	const rights = await getRights(req.user_id);

	const { guild_id } = req.params;
	let { member_id } = req.params;
	if (member_id === "@me") {
		member_id = req.user_id;
		rights.hasThrow("JOIN_GUILDS");
	} else {
		// TODO: join others by controller
	}

	const guild = await Guild.findOneOrFail({
		where: { id: guild_id },
	});

	const emoji = await Emoji.find({
		where: { guild_id: guild_id },
	});

	const roles = await Role.find({
		where: { guild_id: guild_id },
	});

	const stickers = await Sticker.find({
		where: { guild_id: guild_id },
	});

	await Member.addToGuild(member_id, guild_id);
	res.send({ ...guild, emojis: emoji, roles: roles, stickers: stickers });
});

router.delete("/", route({}), async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	const permission = await getPermission(req.user_id, guild_id);
	const rights = await getRights(req.user_id);
	if (member_id === "@me" || member_id === req.user_id) {
		// TODO: unless force-joined
		rights.hasThrow("SELF_LEAVE_GROUPS");
	} else {
		rights.hasThrow("KICK_BAN_MEMBERS");
		permission.hasThrow("KICK_MEMBERS");
	}

	await Member.removeFromGuild(member_id, guild_id);
	res.sendStatus(204);
});

export default router;
