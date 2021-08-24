import { Router, Response, Request } from "express";
import { Channel, toObject, ChannelUpdateEvent, getPermission, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";

import { check } from "../../../util/instanceOf";
import { createChannel } from "../../../util/Channel";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const channels = await Channel.find({ guild_id });

	res.json(channels);
});

// TODO: check if channel type is permitted
// TODO: check if parent_id exists

router.post("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
	// creates a new guild channel https://discord.com/developers/docs/resources/guild#create-guild-channel
	const { guild_id } = req.params;
	const body = req.body as ChannelModifySchema;

	const channel = await createChannel({ ...body, guild_id }, req.user_id);

	res.status(201).json(channel);
});

// TODO: check if parent_id exists
router.patch(
	"/",
	check([{ id: String, $position: Number, $lock_permissions: Boolean, $parent_id: String }]),
	async (req: Request, res: Response) => {
		// changes guild channel position
		const { guild_id } = req.params;
		const body = req.body as { id: string; position?: number; lock_permissions?: boolean; parent_id?: string }[];

		const permission = await getPermission(req.user_id, guild_id);
		permission.hasThrow("MANAGE_CHANNELS");

		await Promise.all([
			body.map(async (x) => {
				if (!x.position && !x.parent_id) throw new HTTPError(`You need to at least specify position or parent_id`, 400);

				const opts: any = {};
				if (x.position) opts.position = x.position;

				if (x.parent_id) {
					opts.parent_id = x.parent_id;
					const parent_channel = await Channel.findOneOrFail({ id: x.parent_id, guild_id }, { permission_overwrites: true });
					if (x.lock_permissions) {
						opts.permission_overwrites = parent_channel.permission_overwrites;
					}
				}

				const channel = await Channel.findOneOrFailAndUpdate({ id: x.id, guild_id }, opts, { new: true });

				await emitEvent({ event: "CHANNEL_UPDATE", data: channel), channel_id: x.id, guild_id } as ChannelUpdateEvent;
			})
		]);

		res.sendStatus(204);
	}
);

export default router;
