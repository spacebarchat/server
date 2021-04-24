import { Router, Request, Response } from "express";
import { ChannelModel, MemberModel, UserModel, GuildDeleteEvent, GuildMemberRemoveEvent, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }, { guilds: true }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var testID = "829044530203328513"; //FOR TEST

	var channels = await ChannelModel.find({ recipients: req.user_id }).exec(); 

	res.json(toObject(channels));
});

export default router;