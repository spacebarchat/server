import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

import { check } from "../../../util/instanceOf";
import { random } from "../../../util/RandomInviteID";
import { emitEvent } from "../../../util/Event";

import { InviteCreateSchema } from "../../../schema/Invite";

import { getPermission, ChannelModel, InviteModel, InviteCreateEvent, toObject } from "@fosscord/server-util";

const router: Router = Router();

router.post("/", check(InviteCreateSchema), async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await ChannelModel.findOne({ id: channel_id }).exec();

	if (!channel || !channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;

	const permission = await getPermission(user_id, guild_id);

	if (!permission.has("CREATE_INSTANT_INVITE")) {
		throw new HTTPError("You aren't authorised to access this endpoint", 401);
	}

	const invite = {
		code: random(),
		temporary: req.body.temporary,
		uses: 0,
		max_uses: req.body.max_uses,
		max_age: req.body.max_age,
		created_at: new Date(),
		guild_id,
		channel_id: channel_id,
		inviter_id: user_id,
	};

	await new InviteModel(invite).save();

	await emitEvent({ event: "INVITE_CREATE", data: invite, guild_id } as InviteCreateEvent);
	res.status(201).send(invite);
});

router.get("/", async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await ChannelModel.findOne({ id: channel_id }).exec();

	if (!channel || !channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;
	const permission = await getPermission(user_id, guild_id);

	if (!permission.has("MANAGE_CHANNELS")) {
		throw new HTTPError("You aren't authorised to access this endpoint", 401);
	}

	const invites = await InviteModel.find({ guild_id }).exec();

	res.status(200).send(toObject(invites));
});

export default router;
