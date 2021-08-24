import { Channel, emitEvent, Member, toObject, TypingStartEvent } from "@fosscord/util";
import { Router, Request, Response } from "express";

import { HTTPError } from "lambert-server";

const router: Router = Router();

router.post("/", async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const user_id = req.user_id;
	const timestamp = Date.now();
	const channel = await Channel.findOneOrFail({ id: channel_id });
	const member = await Member.findOneOrFail({ id: user_id });

	await emitEvent({
		event: "TYPING_START",
		channel_id: channel_id,
		data: {
			// this is the paylod
			member: member,
			channel_id,
			timestamp,
			user_id,
			guild_id: channel.guild_id
		}
	} as TypingStartEvent);
	res.sendStatus(204);
});

export default router;
