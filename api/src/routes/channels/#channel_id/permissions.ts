import { Channel, ChannelPermissionOverwrite, ChannelUpdateEvent, emitEvent, getPermission, Member, Role } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";

import { check } from "../../../util/instanceOf";
const router: Router = Router();

// TODO: Only permissions your bot has in the guild or channel can be allowed/denied (unless your bot has a MANAGE_ROLES overwrite in the channel)

router.put("/:overwrite_id", check({ allow: String, deny: String, type: Number, id: String }), async (req: Request, res: Response) => {
	const { channel_id, overwrite_id } = req.params;
	const body = req.body as { allow: bigint; deny: bigint; type: number; id: string };

	var channel = await Channel.findOneOrFail({ id: channel_id });
	if (!channel.guild_id) throw new HTTPError("Channel not found", 404);

	const permissions = await getPermission(req.user_id, channel.guild_id, channel_id);
	permissions.hasThrow("MANAGE_ROLES");

	if (body.type === 0) {
		if (!(await Role.count({ id: overwrite_id }))) throw new HTTPError("role not found", 404);
	} else if (body.type === 1) {
		if (!(await Member.count({ id: overwrite_id }))) throw new HTTPError("user not found", 404);
	} else throw new HTTPError("type not supported", 501);

	// @ts-ignore
	var overwrite: ChannelPermissionOverwrite = channel.permission_overwrites.find((x) => x.id === overwrite_id);
	if (!overwrite) {
		// @ts-ignore
		overwrite = {
			id: overwrite_id,
			type: body.type,
			allow: body.allow,
			deny: body.deny
		};
		channel.permission_overwrites.push(overwrite);
	}
	overwrite.allow = body.allow;
	overwrite.deny = body.deny;

	// @ts-ignore
	channel = await Channel.findOneOrFailAndUpdate({ id: channel_id }, channel, { new: true });

	await emitEvent({
		event: "CHANNEL_UPDATE",
		channel_id,
		data: channel
	} as ChannelUpdateEvent);

	return res.sendStatus(204);
});

// TODO: check permission hierarchy
router.delete("/:overwrite_id", async (req: Request, res: Response) => {
	const { channel_id, overwrite_id } = req.params;

	const permissions = await getPermission(req.user_id, undefined, channel_id);
	permissions.hasThrow("MANAGE_ROLES");

	const channel = await Channel.findOneOrFail({ id: channel_id });
	if (!channel.guild_id) throw new HTTPError("Channel not found", 404);

	channel.permission_overwrites = channel.permission_overwrites.filter((x) => x.id === overwrite_id);

	await Promise.all([
		channel.save(),
		emitEvent({
			event: "CHANNEL_UPDATE",
			channel_id,
			data: channel
		} as ChannelUpdateEvent)
	]);

	return res.sendStatus(204);
});

export default router;
