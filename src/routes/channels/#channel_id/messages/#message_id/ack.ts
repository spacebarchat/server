import { getPermission } from "@fosscord/server-util";
import { MessageModel } from "@fosscord/server-util";
import { Event } from "@fosscord/server-util";
import { ChannelModel } from "@fosscord/server-util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../../../util/Event";

const router = Router();

// router.pot("/", async (req: Request, res: Response) => {
// 	const { channel_id, message_id } = req.params;

// 	const permission = await getPermission(req.user_id, channel?.guild_id, channel_id, { channel });
// 	permission.hasThrow("MANAGE_MESSAGES");

// 	await emitEvent({
// 		event: "MESSAGE_ACK",
// 		channel_id,
// 		data: {
// 			channel_id,
// 			message_id
// 		}
// 	} as MessageAckEvent);

// 	res.sendStatus(204);
// });

export default router;
