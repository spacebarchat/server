import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { random } from "@fosscord/api";
import { Channel, Invite, InviteCreateEvent, emitEvent, User, Guild, PublicInviteRelation } from "@fosscord/util";
import { isTextChannel } from "./messages";

const router: Router = Router();

export interface InviteCreateSchema {
	target_user_id?: string;
	target_type?: string;
	validate?: string; // ? what is this
	max_age?: number;
	max_uses?: number;
	temporary?: boolean;
	unique?: boolean;
	target_user?: string;
	target_user_type?: number;
}

router.post("/", route({ body: "InviteCreateSchema", permission: "CREATE_INSTANT_INVITE" }), async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, select: ["id", "name", "type", "guild_id"] });
	isTextChannel(channel.type);

	if (!channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;

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
	data.guild = await Guild.findOne({ id: guild_id });
	data.channel = channel;

	await emitEvent({ event: "INVITE_CREATE", data, guild_id } as InviteCreateEvent);
	res.status(201).send(data);
});

router.get("/", route({ permission: "MANAGE_CHANNELS" }), async (req: Request, res: Response) => {
	const { user_id } = req;
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ id: channel_id });

	if (!channel.guild_id) {
		throw new HTTPError("This channel doesn't exist", 404);
	}
	const { guild_id } = channel;

	const invites = await Invite.find({ where: { guild_id }, relations: PublicInviteRelation });

	res.status(200).send(invites);
});

export default router;
