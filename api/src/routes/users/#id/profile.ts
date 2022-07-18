import { Router, Request, Response } from "express";
import { PublicConnectedAccount, PublicUser, User, UserPublic, Member } from "@fosscord/util";
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
	const user = await User.getPublicUser(req.params.id, { relations: ["connected_accounts"] });

	let mutual_guilds: object[] = [];
	let premium_guild_since;
	const requested_member = await Member.find( { where: { id: req.params.id, } })
	const self_member = await Member.find( { where: { id: req.user_id, } })

	for(const rmem of requested_member) {
		if(rmem.premium_since) {
			if(premium_guild_since){
				if(premium_guild_since > rmem.premium_since) {
					premium_guild_since = rmem.premium_since;
				}
			} else {
				premium_guild_since = rmem.premium_since;
			}
		}
		for(const smem of self_member) {
			if (smem.guild_id === rmem.guild_id) {
				mutual_guilds.push({id: rmem.guild_id, nick: rmem.nick})
			}
		}
	}
	res.json({
		connected_accounts: user.connected_accounts,
		premium_guild_since: premium_guild_since, // TODO
		premium_since: user.premium_since, // TODO
		mutual_guilds: mutual_guilds, // TODO {id: "", nick: null} when ?with_mutual_guilds=true
		user: {
			username: user.username,
			discriminator: user.discriminator,
			id: user.id,
			public_flags: user.public_flags,
			avatar: user.avatar,
			accent_color: user.accent_color,
			banner: user.banner,
			bio: req.user_bot ? null : user.bio,
			bot: user.bot
		}
	});
});

export default router;
