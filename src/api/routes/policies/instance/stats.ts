import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Attachment, Config, Guild, Message, RateLimit, Session, User } from "@fosscord/util";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json({
		all_time: {
			users: await User.count(),
			guilds: await Guild.count(),
			messages: await Message.count(),
			attachments: await Attachment.count(),
		},
		now: {
			sessions: await Session.count(),
			rate_limits: await RateLimit.count(),
		}
	});
});

export default router;
