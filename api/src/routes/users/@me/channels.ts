import { Router, Request, Response } from "express";
import {
	ChannelModel,
	ChannelCreateEvent,
	toObject,
	ChannelType,
	Snowflake,
	trimSpecial,
	Channel,
	DMChannel,
	UserModel,
	emitEvent
} from "@fosscord/util";
import { HTTPError } from "lambert-server";

import { DmChannelCreateSchema } from "../../../schema/Channel";
import { check } from "../../../util/instanceOf";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	var channels = await ChannelModel.find({ recipient_ids: req.user_id }).exec();

	res.json(toObject(channels));
});

router.post("/", check(DmChannelCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as DmChannelCreateSchema;

	body.recipients = body.recipients.filter((x) => x !== req.user_id).unique();

	if (!(await Promise.all(body.recipients.map((x) => UserModel.exists({ id: x })))).every((x) => x)) {
		throw new HTTPError("Recipient not found");
	}

	const type = body.recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;
	const name = trimSpecial(body.name);

	const channel = await new ChannelModel({
		name,
		type,
		owner_id: req.user_id,
		id: Snowflake.generate(),
		created_at: new Date(),
		last_message_id: null,
		recipient_ids: [...body.recipients, req.user_id]
	}).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: toObject(channel), user_id: req.user_id } as ChannelCreateEvent);

	res.json(toObject(channel));
});

export default router;
