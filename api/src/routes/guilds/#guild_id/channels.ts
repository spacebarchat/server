import { Router, Response, Request } from "express";
import { ChannelModel, toObject, ChannelUpdateEvent, getPermission, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";

import { check } from "../../../util/instanceOf";
import { createChannel } from "../../../util/Channel";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const channels = await ChannelModel.find({ guild_id }).exec();

	res.json(toObject(channels));
});

// TODO: check if channel type is permitted
// TODO: check if parent_id exists

router.post("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
	// creates a new guild channel https://discord.com/developers/docs/resources/guild#create-guild-channel
	const { guild_id } = req.params;
	const body = req.body as ChannelModifySchema;

	const channel = await createChannel({ ...body, guild_id }, req.user_id);

	res.json(toObject(channel));
});

// TODO: check if parent_id exists
router.patch(
	"/",
	check([{ id: String, $position: Number, $lock_permissions: Boolean, $parent_id: String }]),
	async (req: Request, res: Response) => {
		// changes guild channel position
		const { guild_id } = req.params;
		const body = req.body as { id: string; position?: number; lock_permissions?: boolean; parent_id?: string };
		body.position = Math.floor(body.position || 0);
		if (!body.position && !body.parent_id) throw new HTTPError(`You need to at least specify position or parent_id`, 400);

		const permission = await getPermission(req.user_id, guild_id);
		permission.hasThrow("MANAGE_CHANNELS");

		const opts: any = {};
		if (body.position) opts.position = body.position;

		if (body.parent_id) {
			opts.parent_id = body.parent_id;
			const parent_channel = await ChannelModel.findOne({ id: body.parent_id, guild_id }, { permission_overwrites: true }).exec();
			if (body.lock_permissions) {
				opts.permission_overwrites = parent_channel.permission_overwrites;
			}
		}

		const channel = await ChannelModel.findOneAndUpdate({ id: req.body, guild_id }, opts, { new: true }).exec();

		await emitEvent({ event: "CHANNEL_UPDATE", data: toObject(channel), channel_id: body.id, guild_id } as ChannelUpdateEvent);

		res.json(toObject(channel));
	}
);

export default router;
