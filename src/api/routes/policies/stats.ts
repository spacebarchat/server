import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Config, User, getRights, UserPublic, Member, Guild, Message } from "@fosscord/util";
const router = Router();


router.get("/",route({}), async (req: Request, res: Response) => {
	let users,guilds,msgs,memberships;
	// needs to be let otherwise we can't for

	let config = Config.get();
	if (!config.security.statsWorldReadable) {
		let rights = await getRights(req.user_id);
		rights.hasThrow("VIEW_SERVER_STATS");
	}
	users = await User.count();
	guilds = await Guild.count();
	msgs = await Message.count();
	memberships = await Member.count();
	res.json({user_count: users, guild_count: guilds, msg_count: msgs, membership_rels: memberships});
});

export default router;
