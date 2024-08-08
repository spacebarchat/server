import { route } from "@spacebar/api";
import {
	Config,
	DiscordApiErrors,
	getPermission,
	Webhook,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get(
	"/",
	route({
		description:
			"Returns a webhook object for the given id. Requires the MANAGE_WEBHOOKS permission or to be the owner of the webhook.",
		responses: {
			200: {
				body: "APIWebhook",
			},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { webhook_id } = req.params;
		const webhook = await Webhook.findOneOrFail({
			where: { id: webhook_id },
			relations: [
				"user",
				"channel",
				"source_channel",
				"guild",
				"source_guild",
				"application",
			],
		});

		if (webhook.guild_id) {
			const permission = await getPermission(
				req.user_id,
				webhook.guild_id,
			);

			if (!permission.has("MANAGE_WEBHOOKS"))
				throw DiscordApiErrors.UNKNOWN_WEBHOOK;
		} else if (webhook.user_id != req.user_id)
			throw DiscordApiErrors.UNKNOWN_WEBHOOK;

		const instanceUrl =
			Config.get().api.endpointPublic || "http://localhost:3001";
		return res.json({
			...webhook,
			url: instanceUrl + "/webhooks/" + webhook.id + "/" + webhook.token,
		});
	},
);

export default router;
