import { Router, Request, Response } from "express";
import { getPermission, Guild, PublicGuildRelations } from "@fosscord/util";
import { route } from "@fosscord/api";
const router = Router();

router.get("/subscriptions", route({ permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ where: { id: guild_id } /*, relations: PublicGuildRelations*/ });
	const boosts = guild.premium_subscription_count;

	if (boosts === undefined) return res.json([]);

	const jsonObj = [];

	for (let i = 0; i < boosts; i++) {
		jsonObj.push({
			id: i.toString(),
			user_id: "0",
			guild_id: guild_id.toString(),
			ended: false,
			user: {
				id: 0,
				username: "Fosscord",
				avatar: "default",
				discriminator: "0000",
				public_flags: 4096
			}
		});
	}

	return res.json(jsonObj);
});

export default router;
