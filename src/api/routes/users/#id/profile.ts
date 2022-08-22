import { Router, Request, Response } from "express";
import { PublicConnectedAccount, PublicUser, User, UserPublic, Member, Guild } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

export interface UserProfileResponse {
	user: UserPublic;
	connected_accounts: PublicConnectedAccount;
	premium_guild_since?: Date;
	premium_since?: Date;
}

router.get("/", route({ test: { response: { body: "UserProfileResponse" } } }), async (req: Request, res: Response) => {
	if (req.params.id === "@me") req.params.id = req.user_id;

	const { guild_id, with_mutual_guilds } = req.query;

	const user = await User.getPublicUser(req.params.id, { relations: ["connected_accounts"] });

	var mutual_guilds: object[] = [];
	var premium_guild_since;

	if (with_mutual_guilds == "true") {
		const requested_member = await Member.find({ where: { id: req.params.id } });
		const self_member = await Member.find({ where: { id: req.user_id } });

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
					mutual_guilds.push({ id: rmem.guild_id, nick: rmem.nick });
				}
			}
		}
	}

	const guild_member = guild_id && typeof guild_id == "string"
		? await Member.findOneOrFail({ id: req.params.id, guild_id: guild_id }, { relations: ["roles"] })
		: undefined;

	// TODO: make proper DTO's in util?

	const userDto = {
		username: user.username,
		discriminator: user.discriminator,
		id: user.id,
		public_flags: user.public_flags,
		avatar: user.avatar,
		accent_color: user.accent_color,
		banner: user.banner,
		bio: req.user_bot ? null : user.bio,
		bot: user.bot
	};

	const guildMemberDto = guild_member ? {
		avatar: user.avatar,	// TODO
		banner: user.banner,	// TODO
		bio: req.user_bot ? null : user.bio, // TODO
		communication_disabled_until: null,	// TODO
		deaf: guild_member.deaf,
		flags: user.flags,
		is_pending: guild_member.pending,
		pending: guild_member.pending,	// why is this here twice, discord?
		joined_at: guild_member.joined_at,
		mute: guild_member.mute,
		nick: guild_member.nick,
		premium_since: guild_member.premium_since,
		roles: guild_member.roles.map(x => x.id).filter(id => id != guild_id),
		user: userDto
	} : undefined;

	res.json({
		connected_accounts: user.connected_accounts,
		premium_guild_since: premium_guild_since, // TODO
		premium_since: user.premium_since, // TODO
		mutual_guilds: mutual_guilds, // TODO {id: "", nick: null} when ?with_mutual_guilds=true
		user: userDto,
		guild_member: guildMemberDto,
	});
});

export default router;
