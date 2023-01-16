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

import { Router, Request, Response } from "express";
import { Guild, Member, Snowflake } from "@fosscord/util";
import { LessThan, IsNull } from "typeorm";
import { route } from "@fosscord/api";
const router = Router();

//Returns all inactive members, respecting role hierarchy
export const inactiveMembers = async (
	guild_id: string,
	user_id: string,
	days: number,
	roles: string[] = [],
) => {
	var date = new Date();
	date.setDate(date.getDate() - days);
	//Snowflake should have `generateFromTime` method? Or similar?
	var minId = BigInt(date.valueOf() - Snowflake.EPOCH) << BigInt(22);

	/**
	idea: ability to customise the cutoff variable
	possible candidates: public read receipt, last presence, last VC leave
	**/
	var members = await Member.find({
		where: [
			{
				guild_id,
				last_message_id: LessThan(minId.toString()),
			},
			{
				guild_id,
				last_message_id: IsNull(),
			},
		],
		relations: ["roles"],
	});
	if (!members.length) return [];

	//I'm sure I can do this in the above db query ( and it would probably be better to do so ), but oh well.
	if (roles.length && members.length)
		members = members.filter((user) =>
			user.roles?.some((role) => roles.includes(role.id)),
		);

	const me = await Member.findOneOrFail({
		where: { id: user_id, guild_id },
		relations: ["roles"],
	});
	const myHighestRole = Math.max(...(me.roles?.map((x) => x.position) || []));

	const guild = await Guild.findOneOrFail({ where: { id: guild_id } });

	members = members.filter(
		(member) =>
			member.id !== guild.owner_id && //can't kick owner
			member.roles?.some(
				(role) =>
					role.position < myHighestRole || //roles higher than me can't be kicked
					me.id === guild.owner_id, //owner can kick anyone
			),
	);

	return members;
};

router.get("/", route({}), async (req: Request, res: Response) => {
	const days = parseInt(req.query.days as string);

	var roles = req.query.include_roles;
	if (typeof roles === "string") roles = [roles]; //express will return array otherwise

	const members = await inactiveMembers(
		req.params.guild_id,
		req.user_id,
		days,
		roles as string[],
	);

	res.send({ pruned: members.length });
});

router.post(
	"/",
	route({ permission: "KICK_MEMBERS", right: "KICK_BAN_MEMBERS" }),
	async (req: Request, res: Response) => {
		const days = parseInt(req.body.days);

		var roles = req.query.include_roles;
		if (typeof roles === "string") roles = [roles];

		const { guild_id } = req.params;
		const members = await inactiveMembers(
			guild_id,
			req.user_id,
			days,
			roles as string[],
		);

		await Promise.all(
			members.map((x) => Member.removeFromGuild(x.id, guild_id)),
		);

		res.send({ purged: members.length });
	},
);

export default router;
