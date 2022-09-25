import { Request, Response, Router } from "express";
import { Recipient, DmChannelDTO, Channel } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const recipients = await Recipient.find({
		where: { user_id: req.user_id, closed: false },
		relations: ["channel", "channel.recipients"]
	});
	res.json(await Promise.all(recipients.map((r) => DmChannelDTO.from(r.channel, [req.user_id]))));
});

export interface DmChannelCreateSchema {
	name?: string;
	recipients: string[];
}

router.post("/", route({ body: "DmChannelCreateSchema" }), async (req: Request, res: Response) => {
	const body = req.body as DmChannelCreateSchema;
	res.json(await Channel.createDMChannel(body.recipients, req.user_id, body.name));
});

export default router;
