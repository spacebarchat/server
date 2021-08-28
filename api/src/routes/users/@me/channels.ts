import { Router, Request, Response } from "express";
import { Channel, ChannelCreateEvent, ChannelType, Snowflake, trimSpecial, User, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";

import { DmChannelCreateSchema } from "../../../schema/Channel";
import { check } from "../../../util/instanceOf";
import { In } from "typeorm";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	var channels = await Channel.find({ recipient_ids: req.user_id });

	res.json(channels);
});

router.post("/", check(DmChannelCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as DmChannelCreateSchema;

	body.recipients = body.recipients.filter((x) => x !== req.user_id).unique();

	const recipients = await User.find({ id: In(body.recipients) });

	if (recipients.length !== body.recipients.length) {
		throw new HTTPError("Recipient/s not found");
	}

	const type = body.recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;
	const name = trimSpecial(body.name);

	const channel = await new Channel({
		name,
		type,
		owner_id: req.user_id,
		created_at: new Date(),
		last_message_id: null,
		recipient_ids: [...body.recipients, req.user_id]
	}).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, user_id: req.user_id } as ChannelCreateEvent);

	res.json(channel);
});

export default router;
