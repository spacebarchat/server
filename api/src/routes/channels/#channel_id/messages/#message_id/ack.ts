import { emitEvent, getPermission, MessageAckEvent, ReadState } from "@fosscord/util";
import { Request, Response, Router } from "express";

import { check } from "../../../../../util/instanceOf";

const router = Router();

// TODO: check if message exists
// TODO: send read state event to all channel members

router.post("/", check({ $manual: Boolean, $mention_count: Number }), async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const permission = await getPermission(req.user_id, undefined, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	await ReadState.update({ user_id: req.user_id, channel_id, message_id }, { user_id: req.user_id, channel_id, message_id });

	await emitEvent({
		event: "MESSAGE_ACK",
		user_id: req.user_id,
		data: {
			channel_id,
			message_id,
			version: 496
		}
	} as MessageAckEvent);

	res.sendStatus(204);
});

export default router;
