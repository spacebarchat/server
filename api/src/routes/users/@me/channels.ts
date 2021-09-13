import { Router, Request, Response } from "express";
import { Channel, ChannelCreateEvent, ChannelType, Snowflake, trimSpecial, User, emitEvent, Recipient } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { In } from "typeorm";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const recipients = await Recipient.find({ where: { user_id: req.user_id }, relations: ["channel"] });

	res.json(recipients.map((x) => x.channel));
});

export interface DmChannelCreateSchema {
	name?: string;
	recipients: string[];
}

router.post("/", route({ body: "DmChannelCreateSchema" }), async (req: Request, res: Response) => {
	const body = req.body as DmChannelCreateSchema;

	body.recipients = body.recipients.filter((x) => x !== req.user_id).unique();

	const recipients = await User.find({ where: body.recipients.map((x) => ({ id: x })) });

	if (recipients.length !== body.recipients.length) {
		throw new HTTPError("Recipient/s not found");
	}

	const type = body.recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;
	const name = trimSpecial(body.name);

	const channel = await new Channel({
		name,
		type,
		// owner_id only for group dm channels
		created_at: new Date(),
		last_message_id: null,
		recipients: [...body.recipients.map((x) => new Recipient({ user_id: x })), new Recipient({ user_id: req.user_id })]
	}).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, user_id: req.user_id } as ChannelCreateEvent);

	res.json(channel);
});

export default router;
