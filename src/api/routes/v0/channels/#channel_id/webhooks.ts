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
import { isTextChannel } from "./messages/index";
import { DiscordApiErrors } from "@fosscord/util";
import crypto from "crypto";

const router: Router = Router();

//TODO: implement webhooks
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});

export default router;
