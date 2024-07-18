import { route } from "@spacebar/api";
import { Webhook } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get(
	"/",
	route({
		description: "Returns a webhook object for the given id.",
		responses: {
			200: {
				body: "APIWebhook",
			},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		// TODO: Permission check
		const { webhook_id } = req.params;
		const webhook = await Webhook.findOneOrFail({
			where: { id: webhook_id },
			relations: [
				"user",
				"guild",
				"source_guild",
				"application" /*"source_channel"*/,
			],
		});
		return res.json(webhook);
	},
);

export default router;
