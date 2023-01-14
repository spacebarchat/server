import {
	emitEvent,
	getPermission,
	MessageAckEvent,
	ReadState,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router = Router();

// TODO: public read receipts & privacy scoping
// TODO: send read state event to all channel members
// TODO: advance-only notification cursor

router.post(
	"/",
	route({ body: "MessageAcknowledgeSchema" }),
	async (req: Request, res: Response) => {
		const { channel_id, message_id } = req.params;

		const permission = await getPermission(
			req.user_id,
			undefined,
			channel_id,
		);
		permission.hasThrow("VIEW_CHANNEL");

		let read_state = await ReadState.findOne({
			where: { user_id: req.user_id, channel_id },
		});
		if (!read_state)
			read_state = ReadState.create({ user_id: req.user_id, channel_id });
		read_state.last_message_id = message_id;

		await read_state.save();

		await emitEvent({
			event: "MESSAGE_ACK",
			user_id: req.user_id,
			data: {
				channel_id,
				message_id,
				version: 3763,
			},
		} as MessageAckEvent);

		res.json({ token: null });
	},
);

export default router;
