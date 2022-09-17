import { route } from "@fosscord/api";
import {
	Channel,
	ChannelPermissionOverwrite,
	ChannelPermissionOverwriteSchema,
	ChannelUpdateEvent,
	emitEvent,
	HTTPError,
	Member,
	Role
} from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.put(
	"/:overwrite_id",
	route({ body: "ChannelPermissionOverwriteSchema", permission: "MANAGE_ROLES" }),
	async (req: Request, res: Response) => {
		const { channel_id, overwrite_id } = req.params;
		const body = req.body as ChannelPermissionOverwriteSchema;

		let channel = await Channel.findOneOrFail({ where: { id: channel_id } });
		if (!channel.guild_id) throw new HTTPError(req.t("common:notfound.CHANNEL"), 404);

		if (body.type === 0) {
			if (!(await Role.count({ where: { id: overwrite_id } }))) throw new HTTPError(req.t("common:notfound.ROLE"), 404);
		} else if (body.type === 1) {
			if (!(await Member.count({ where: { id: overwrite_id } }))) throw new HTTPError(req.t("common:notfound.USER"), 404);
		} else throw new HTTPError("type not supported", 501);

		// @ts-ignore
		let overwrite: ChannelPermissionOverwrite = channel.permission_overwrites.find((x) => x.id === overwrite_id);
		if (!overwrite) {
			// @ts-ignore
			overwrite = {
				id: overwrite_id,
				type: body.type
			};
			channel.permission_overwrites!.push(overwrite);
		}
		overwrite.allow = String(req.permission!.bitfield & (BigInt(body.allow) || BigInt("0")));
		overwrite.deny = String(req.permission!.bitfield & (BigInt(body.deny) || BigInt("0")));

		await Promise.all([
			channel.save(),
			emitEvent({
				event: "CHANNEL_UPDATE",
				channel_id,
				data: channel
			} as ChannelUpdateEvent)
		]);

		return res.sendStatus(204);
	}
);

// TODO: check permission hierarchy
router.delete("/:overwrite_id", route({ permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
	const { channel_id, overwrite_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id } });
	if (!channel.guild_id) throw new HTTPError(req.t("common:notfound.CHANNEL"), 404);

	channel.permission_overwrites = channel.permission_overwrites!.filter((x) => x.id === overwrite_id);

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
