import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

import { check } from "../../../util/instanceOf";
import { random } from "../../../util/RandomInviteID";

import { InviteCreateSchema } from "../../../schema/Invite";

import { getPermission, Channel, Invite, InviteCreateEvent, emitEvent, User, Guild } from "@fosscord/util";
import { isTextChannel } from "./messages";

const router: Router = Router();

router.post("/", check(InviteCreateSchema), async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, select: ["id", "name", "type", "guild_id"] });
	isTextChannel(channel.type);

	if (!channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;

	const permission = await getPermission(user_id, guild_id, undefined, {
		guild_select: [
			"banner",
			"description",
			"features",
			"icon",
			"id",
			"name",
			"nsfw",
			"nsfw_level",
			"splash",
			"vanity_url_code",
			"verification_level"
		] as (keyof Guild)[]
	});
	permission.hasThrow("CREATE_INSTANT_INVITE");

	const expires_at = new Date(req.body.max_age * 1000 + Date.now());

	const invite = await new Invite({
		code: random(),
		temporary: req.body.temporary,
		uses: 0,
		max_uses: req.body.max_uses,
		max_age: req.body.max_age,
		expires_at,
		created_at: new Date(),
		guild_id,
		channel_id: channel_id,
		inviter_id: user_id
	}).save();
	const data = invite.toJSON();
	data.inviter = await User.getPublicUser(req.user_id);
	data.guild = permission.cache.guild;
	data.channel = channel;

	await emitEvent({ event: "INVITE_CREATE", data, guild_id } as InviteCreateEvent);
	res.status(201).send(data);
});

router.get("/", async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ id: channel_id });

	if (!channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;
	const permission = await getPermission(user_id, guild_id);
	permission.hasThrow("MANAGE_CHANNELS");

	const invites = await Invite.find({ guild_id });

	res.status(200).send(invites);
});

export default router;
