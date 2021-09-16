import { Request, Response, Router } from "express";
import { PublicUserProjection, Recipient, User, ChannelService } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const recipients = await Recipient.find({ where: { user_id: req.user_id }, relations: ["channel", "user"] });

	//TODO check if this is right
	const aa = await Promise.all(recipients.map(async (x) => {
		return {
			...(x.channel),
			recipients: await User.findOneOrFail({ where: { id: x.user_id }, select: PublicUserProjection }),
		}
	}))

	res.json(aa);
});

export interface DmChannelCreateSchema {
	name?: string;
	recipients: string[];
}

router.post("/", route({ body: "DmChannelCreateSchema" }), async (req: Request, res: Response) => {
	const body = req.body as DmChannelCreateSchema;
	res.json(await ChannelService.createDMChannel(body.recipients, req.user_id, body.name));
});

export default router;
