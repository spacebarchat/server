import { Router, Request, Response } from "express";
import { PublicConnectedAccount, PublicUser, User, UserPublic } from "@fosscord/util";
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

	res.json({
		connected_accounts: user.connected_accounts,
		premium_guild_since: null, // TODO
		premium_since: null, // TODO
		mutual_guilds: [], // TODO {id: "", nick: null} when ?with_mutual_guilds=true
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
