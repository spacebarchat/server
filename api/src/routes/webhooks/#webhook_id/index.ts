import { Channel, Config, emitEvent, JWTOptions, Webhook, WebhooksUpdateEvent } from "@fosscord/util";
import { route, Authentication, handleFile } from "@fosscord/api";
import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTPError } from "lambert-server";
const router = Router();

export interface WebhookModifySchema {
	name?: string;
	avatar?: string;
	// channel_id?: string; // TODO
}

function validateWebhookToken(req: Request, res: Response, next: NextFunction) {
	const { jwtSecret } = Config.get().security;

	jwt.verify(req.params.token, jwtSecret, JWTOptions, async (err, decoded: any) => {
		if (err) return next(new HTTPError("Invalid Token", 401));
		next();
	});
}

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json(await Webhook.findOneOrFail({ id: req.params.webhook_id }));
});

router.get("/:token", route({}), validateWebhookToken, async (req: Request, res: Response) => {
	res.json(await Webhook.findOneOrFail({ id: req.params.webhook_id }));
});

router.patch("/", route({ body: "WebhookModifySchema", permission: "MANAGE_WEBHOOKS" }), (req: Request, res: Response) => {
	return updateWebhook(req, res);
});

router.patch("/:token", route({ body: "WebhookModifySchema" }), validateWebhookToken, (req: Request, res: Response) => {
	return updateWebhook(req, res);
});

async function updateWebhook(req: Request, res: Response) {
	const webhook = await Webhook.findOneOrFail({ id: req.params.webhook_id });
	if (req.body.channel_id) await Channel.findOneOrFail({ id: req.body.channel_id, guild_id: webhook.guild_id });

	webhook.assign({
		...req.body,
		avatar: await handleFile(`/icons/${req.params.webhook_id}`, req.body.avatar)
	});

	await Promise.all([
		emitEvent({
			event: "WEBHOOKS_UPDATE",
			channel_id: webhook.channel_id,
			data: {
				channel_id: webhook.channel_id,
				guild_id: webhook.guild_id
			}
		} as WebhooksUpdateEvent),
		webhook.save()
	]);

	res.json(webhook);
}

router.delete("/", route({ permission: "MANAGE_WEBHOOKS" }), async (req: Request, res: Response) => {
	return deleteWebhook(req, res);
});

router.delete("/:token", route({}), validateWebhookToken, (req: Request, res: Response) => {
	return deleteWebhook(req, res);
});

async function deleteWebhook(req: Request, res: Response) {
	const webhook = await Webhook.findOneOrFail({ id: req.params.webhook_id });

	await Promise.all([
		emitEvent({
			event: "WEBHOOKS_UPDATE",
			channel_id: webhook.channel_id,
			data: {
				channel_id: webhook.channel_id,
				guild_id: webhook.guild_id
			}
		} as WebhooksUpdateEvent),
		webhook.remove()
	]);

	res.sendStatus(204);
}

export default router;
