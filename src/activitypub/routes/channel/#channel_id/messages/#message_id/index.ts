import { route } from "@spacebar/api";
import { Config, Message } from "@spacebar/util";
import { APAnnounce } from "activitypub-types";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/", route({}), async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const message = await Message.findOneOrFail({
		where: { id: message_id, channel_id },
		relations: { author: true, guild: true },
	});
	const { webDomain } = Config.get().federation;

	const ret: APAnnounce = {
		"@context": "https://www.w3.org/ns/activitystreams",
		id: `https://${webDomain}/fed/channel/${message.channel_id}/messages/${message.id}`,
		type: "Announce",
		actor: `https://${webDomain}/fed/user/${message.author_id}`,
		published: message.timestamp,
		to: `https://${webDomain}/fed/channel/${message.channel_id}/followers`,
		object: message.toAP(),
	};

	return res.json(ret);
});
