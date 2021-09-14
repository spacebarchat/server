import { Router, Response, Request } from "express";
import { handleFile, route } from "@fosscord/api";
import {
	Channel,
	Config,
	emitEvent,
	getPermission,
	Snowflake,
	trimSpecial,
	User,
	Webhook,
	WebhooksUpdateEvent,
	WebhookType
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { isTextChannel } from "./messages/index";
import { DiscordApiErrors } from "@fosscord/util";
import { generateToken } from "../../auth/login";

const router: Router = Router();
// TODO: webhooks
export interface WebhookCreateSchema {
	/**
	 * @maxLength 80
	 */
	name?: string;
	avatar?: string;
}

router.get("/", route({ permission: "MANAGE_WEBHOOKS" }), async (req, res) => {
	const webhooks = await Webhook.find({
		where: { channel_id: req.params.channel_id },
		select: ["application", "avatar", "channel_id", "guild_id", "id", "token", "type", "user", "source_guild", "name"],
		relations: ["user", "application", "source_guild"]
	});

	res.json(webhooks);
});

// TODO: use Image Data Type for avatar instead of String
router.post("/", route({ body: "WebhookCreateSchema", permission: "MANAGE_WEBHOOKS" }), async (req: Request, res: Response) => {
	var { avatar, name } = req.body as WebhookCreateSchema;
	name = trimSpecial(name) || "Webhook";
	if (name === "clyde") throw new HTTPError("Invalid name", 400);
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ id: channel_id });

	isTextChannel(channel.type);
	if (!channel.guild_id) throw new HTTPError("Not a guild channel", 400);

	const webhook_count = await Webhook.count({ channel_id });
	const { maxWebhooks } = Config.get().limits.channel;
	if (webhook_count > maxWebhooks) throw DiscordApiErrors.MAXIMUM_WEBHOOKS.withParams(maxWebhooks);

	const id = Snowflake.generate();
	// TODO: save webhook in database and send response
	const webhook = await new Webhook({
		id,
		name,
		avatar: await handleFile(`/icons/${id}`, avatar),
		user: await User.getPublicUser(req.user_id),
		guild_id: channel.guild_id,
		channel_id,
		token: await generateToken(id),
		type: WebhookType.Incoming
	}).save();

	await emitEvent({
		event: "WEBHOOKS_UPDATE",
		channel_id,
		data: {
			channel_id,
			guild_id: channel.guild_id
		}
	} as WebhooksUpdateEvent);

	return res.json(webhook);
});

export default router;
