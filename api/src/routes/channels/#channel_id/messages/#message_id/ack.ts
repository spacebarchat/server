import { emitEvent, getPermission, MessageAckEvent, ReadState, Snowflake } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { OrmUtils } from "@fosscord/util";

const router = Router();

router.post("/", route({ body: "MessageAcknowledgeSchema" }), async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const permission = await getPermission(req.user_id, undefined, channel_id);
	permission.hasThrow("VIEW_CHANNEL");

	let read_state = await ReadState.findOne({ where: { user_id: req.user_id, channel_id } });
	if (!read_state) read_state = OrmUtils.mergeDeep(new ReadState(), { user_id: req.user_id, channel_id }) as ReadState;
	read_state.last_message_id = message_id;

	await read_state.save();

	await emitEvent({
		event: "MESSAGE_ACK",
		user_id: req.user_id,
		data: {
			channel_id,
			message_id,
			version: 3763
		}
	} as MessageAckEvent);

	res.sendStatus(204);
});

export default router;
