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
import { Badge, Config, emitEvent, FieldErrors, handleFile, Member, Relationship, User, UserUpdateEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { In } from "typeorm";
import { PrivateUserProjection, PublicUser, PublicUserProjection, RelationshipType, UserProfileModifySchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.get("/", route({ responses: { 200: { body: "UserProfileResponse" } } }), async (req: Request, res: Response) => {
	if (req.params.user_id === "@me") req.params.user_id = req.user_id;

	const { guild_id, with_mutual_guilds, with_mutual_friends, with_mutual_friends_count } = req.query;

	const user = await User.getPublicUser(req.params.user_id, {
		relations: ["connected_accounts"],
	});

	const mutual_guilds: object[] = [];
	let premium_guild_since;

	if (with_mutual_guilds == "true") {
		const requested_member = await Member.find({
			where: { id: req.params.user_id },
		});
		const self_member = await Member.find({
			where: { id: req.user_id },
		});

		for (const rmem of requested_member) {
			if (rmem.premium_since) {
				if (premium_guild_since) {
					if (premium_guild_since > rmem.premium_since) {
						premium_guild_since = rmem.premium_since;
					}
				} else {
					premium_guild_since = rmem.premium_since;
				}
			}
			for (const smem of self_member) {
				if (smem.guild_id === rmem.guild_id) {
					mutual_guilds.push({
						id: rmem.guild_id,
						nick: rmem.nick,
					});
				}
			}
		}
	}

	const guild_member =
		guild_id && typeof guild_id == "string"
			? await Member.findOneOrFail({
					where: { id: req.params.user_id, guild_id: guild_id },
					relations: ["roles"],
				})
			: undefined;

	// TODO: make proper DTO's in util?

	const userProfile = {
		bio: req.user_bot ? null : user.bio,
		accent_color: user.accent_color,
		banner: user.banner,
		pronouns: user.pronouns,
		theme_colors: user.theme_colors?.map((t) => Number(t)), // these are strings for some reason, they should be numbers
	};

	const guildMemberProfile = {
		accent_color: null,
		banner: guild_member?.banner || null,
		bio: guild_member?.bio || "",
		guild_id,
	};

	const badges = await Badge.find();

	let mutual_friends: PublicUser[] = [];
	let mutual_friends_count = 0;

	if (with_mutual_friends == "true" || with_mutual_friends_count == "true") {
		const relationshipsSelf = await Relationship.find({ where: { from_id: req.user_id, type: RelationshipType.friends } });
		const relationshipsUser = await Relationship.find({ where: { from_id: req.params.user_id, type: RelationshipType.friends } });
		const relationshipsIntersection = relationshipsSelf.filter((r1) => relationshipsUser.some((r2) => r2.to_id === r1.to_id));
		if (with_mutual_friends_count) mutual_friends_count = relationshipsIntersection.length;
		if (with_mutual_friends) {
			const users = await User.find({ where: { id: In(relationshipsIntersection.map((r) => r.to_id)) }, select: PublicUserProjection });
			mutual_friends = users.map((u) => u.toPublicUser());
		}
	}

	res.json({
		connected_accounts: user.connected_accounts.filter((x) => x.visibility != 0),
		premium_guild_since: premium_guild_since, // TODO
		premium_since: user.premium_since, // TODO
		mutual_guilds: with_mutual_guilds ? mutual_guilds : undefined, // TODO {id: "", nick: null} when ?with_mutual_guilds=true
		mutual_friends: with_mutual_friends ? mutual_friends : undefined,
		mutual_friends_count: with_mutual_friends_count ? mutual_friends_count : undefined,
		user: user.toPublicUser(),
		premium_type: user.premium_type,
		profile_themes_experiment_bucket: 4, // TODO: This doesn't make it available, for some reason?
		user_profile: userProfile,
		guild_member: { ...guild_member?.toPublicMember(), user: user.toPublicUser() },
		guild_member_profile: guild_id && guildMemberProfile,
		badges: badges.filter((x) => user.badge_ids?.includes(x.id)),
	});
});

router.patch("/", route({ requestBody: "UserProfileModifySchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserProfileModifySchema;

	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);
	const user = await User.findOneOrFail({
		where: { id: req.user_id },
		select: [...PrivateUserProjection, "data"],
	});

	if (body.bio) {
		const { maxBio } = Config.get().limits.user;
		if (body.bio.length > maxBio) {
			throw FieldErrors({
				bio: {
					code: "BIO_INVALID",
					message: `Bio must be less than ${maxBio} in length`,
				},
			});
		}
	}

	user.assign(body);
	await user.save();

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	delete user.data;

	// TODO: send update member list event in gateway
	await emitEvent({
		event: "USER_UPDATE",
		user_id: req.user_id,
		data: user,
	} as UserUpdateEvent);

	res.json({
		accent_color: user.accent_color,
		bio: user.bio,
		banner: user.banner,
		theme_colors: user.theme_colors,
		pronouns: user.pronouns,
	});
});

export default router;
