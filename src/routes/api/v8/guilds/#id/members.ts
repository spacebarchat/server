import { Request, Response, Router } from "express";
import { GuildModel, MemberModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";

const router = Router();

// TODO: needs pagination/only send over websocket
router.get("/:id/members", async (req: Request, res: Response) => {
	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	var members = await MemberModel.find({ guild_id: BigInt(req.params.id) }).exec();
	return res.json(members);
});

export default router;
