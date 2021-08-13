import { ChannelModel, emitEvent, MemberModel, toObject, TypingStartEvent } from "@fosscord/util";
import { Router, Request, Response } from "express";

import { HTTPError } from "lambert-server";

const router: Router = Router();

router.post("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const user_id = req.user_id;
	const timestamp = Date.now();
	const channel = await ChannelModel.findOne({ id: channel_id });
	const member = await MemberModel.findOne({ id: user_id }).exec();

	await emitEvent({
		event: "TYPING_START",
		channel_id: channel_id,
		data: {
			// this is the paylod
			member: toObject(member),
			channel_id,
			timestamp,
			user_id,
			guild_id: channel.guild_id
		}
	} as TypingStartEvent);
	res.sendStatus(204);
});

export default router;
