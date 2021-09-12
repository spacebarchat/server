import { Request, Response, Router } from "express";
import { Guild, Member, PublicMemberProjection } from "@fosscord/util";
import { instanceOf, Length } from "@fosscord/api";
import { MoreThan } from "typeorm";

const router = Router();

// TODO: not allowed for user -> only allowed for bots with privileged intents
// TODO: send over websocket
router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ id: guild_id });
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	try {
		instanceOf({ $limit: new Length(Number, 1, 1000), $after: String }, req.query, {
			path: "query",
			req,
			ref: { obj: null, key: "" }
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}

	const { limit, after } = (<unknown>req.query) as { limit?: number; after?: string };
	const query = after ? { id: MoreThan(after) } : {};

	const members = await Member.find({
		where: { guild_id, ...query },
		select: PublicMemberProjection,
		take: limit || 1,
		order: { id: "ASC" }
	});

	return res.json(members);
});

export default router;
