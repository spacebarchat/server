import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import {
	Channel,
	Config,
	handleFile,
	trimSpecial,
	User,
	Webhook,
	WebhookCreateSchema,
	WebhookType,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { DiscordApiErrors } from "@fosscord/util";
import crypto from "crypto";

const router: Router = Router();

// TODO: use Image Data Type for avatar instead of String
router.post(
	"/",
	route({ body: "WebhookCreateSchema", permission: "MANAGE_WEBHOOKS" }),
	async (req: Request, res: Response) => {
		const channel_id = req.params.channel_id;
		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});

		channel.isTextChannel();
		if (!channel.guild_id) throw new HTTPError("Not a guild channel", 400);

		const webhook_count = await Webhook.count({ where: { channel_id } });
		const { maxWebhooks } = Config.get().limits.channel;
		if (webhook_count > maxWebhooks)
			throw DiscordApiErrors.MAXIMUM_WEBHOOKS.withParams(maxWebhooks);

		let { avatar, name } = req.body as WebhookCreateSchema;
		name = trimSpecial(name);

		// TODO: move this
		if (name === "clyde") throw new HTTPError("Invalid name", 400);
		if (name === "Fosscord Ghost") throw new HTTPError("Invalid name", 400);

		if (avatar) avatar = await handleFile(`/avatars/${channel_id}`, avatar);

		const hook = Webhook.create({
			type: WebhookType.Incoming,
			name,
			avatar,
			guild_id: channel.guild_id,
			channel_id: channel.id,
			user_id: req.user_id,
			token: crypto.randomBytes(24).toString("base64"),
		});

		const user = await User.getPublicUser(req.user_id);

		return res.json({
			...hook,
			user: user,
		});
	},
);

export default router;
