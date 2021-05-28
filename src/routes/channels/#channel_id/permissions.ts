import { ChannelModel, ChannelPermissionOverwrite, getPermission, MemberModel, RoleModel } from "@fosscord/server-util";
import { Router } from "express";
import { HTTPError } from "lambert-server";
import { check } from "../../../util/instanceOf";
const router: Router = Router();

// TODO: Only permissions your bot has in the guild or channel can be allowed/denied (unless your bot has a MANAGE_ROLES overwrite in the channel)

router.put("/:overwrite_id", check({ allow: BigInt, deny: BigInt, type: Number }), async (req, res) => {
	const { channel_id, overwrite_id } = req.params;
	const body = req.body as { allow: bigint; deny: bigint; type: number };

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	if (!channel || !channel.guild_id) throw new HTTPError("Channel not found", 404);

	const permissions = await getPermission(req.user_id, channel.guild_id, channel_id);
	permissions.hasThrow("MANAGE_ROLES");

	if (body.type === 0) {
		if (!(await RoleModel.exists({ id: overwrite_id }))) throw new HTTPError("role not found", 404);
	} else if (body.type === 1) {
		if (await MemberModel.exists({ id: overwrite_id })) throw new HTTPError("user not found", 404);
	} else throw new HTTPError("type not supported");

	// @ts-ignore
	var overwrite: ChannelPermissionOverwrite = channel.permission_overwrites.find((x) => x.id === overwrite_id);
	if (!overwrite) {
		// @ts-ignore
		overwrite = {
			id: overwrite_id,
			type: body.type
		};
		channel.permission_overwrites.push(overwrite);
	}
	overwrite.allow = body.allow;
	overwrite.deny = body.deny;

	await ChannelModel.updateOne({ id: channel_id }, channel).exec();

	return res.sendStatus(204);
});

export default router;
