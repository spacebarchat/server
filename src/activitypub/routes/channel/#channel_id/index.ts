import { route } from "@spacebar/api";
import { Channel, Config } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/", route({}), async (req: Request, res: Response) => {
	const id = req.params.id;

	const channel = await Channel.findOneOrFail({ where: { id } });

	const { webDomain } = Config.get().federation;

	return res.json({
		"@context": "https://www.w3.org/ns/activitystreams",
		type: "Group",
		id: `https://${webDomain}/fed/channel/${channel.id}`,
		name: channel.name,
		preferredUsername: channel.name,
		summary: channel.topic,
		icon: undefined,

		inbox: `https://${webDomain}/fed/channel/${channel.id}/inbox`,
		outbox: `https://${webDomain}/fed/channel/${channel.id}/outbox`,
		followers: `https://${webDomain}/fed/channel/${channel.id}/followers`,
		following: `https://${webDomain}/fed/channel/${channel.id}/following`,
		linked: `https://${webDomain}/fed/channel/${channel.id}/likeds`,
	});
});
