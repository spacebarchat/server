import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Webhook } from "@fosscord/util";

const router: Router = Router();

router.get("/", route({ permission: "MANAGE_WEBHOOKS" }), async (req: Request, res: Response) => {
	const webhooks = await Webhook.find({
		where: { guild_id: req.params.guild_id },
		select: ["application", "avatar", "channel_id", "guild_id", "id", "token", "type", "user", "source_guild", "name"],
		relations: ["user", "application", "source_guild"]
	});

	return res.json(webhooks);
});

export default router;
