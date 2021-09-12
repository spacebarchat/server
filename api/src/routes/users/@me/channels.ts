import { Router, Request, Response } from "express";
import { Channel, ChannelCreateEvent, ChannelType, Snowflake, trimSpecial, User, emitEvent, Recipient } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { DmChannelCreateSchema } from "../../../schema/Channel";
import { check } from "@fosscord/api";
import { In } from "typeorm";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const recipients = await Recipient.find({ where: { user_id: req.user_id }, relations: ["channel"] });

	res.json(recipients.map((x) => x.channel));
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
		recipients: [...body.recipients.map((x) => new Recipient({ id: x })), new Recipient({ id: req.user_id })]
	}).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, user_id: req.user_id } as ChannelCreateEvent);

	res.json(channel);
});

export default router;
