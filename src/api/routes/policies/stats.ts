import { route } from "@fosscord/api";
import { Config, getRights, Guild, Member, Message, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	if (!Config.get().security.statsWorldReadable) {
		const rights = await getRights(req.user_id);
		rights.hasThrow("VIEW_SERVER_STATS");
	}

	res.json({
		counts: {
			user: await User.count(),
			guild: await Guild.count(),
			message: await Message.count(),
			members: await Member.count(),
		}
	});
});

export default router;
