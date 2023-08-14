import { route } from "@spacebar/api";
import { Config, Message } from "@spacebar/util";
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

	return res.json({
		"@context": "https://www.w3.org/ns/activitystreams",
		id: "Announce",
		actor: `https://${webDomain}/fed/user/${message.author!.id}`,
		published: message.timestamp,
		to: ["https://www.w3.org/ns/activitystreams#Public"],
		cc: [
			message.author?.id
				? `https://${webDomain}/fed/users/${message.author.id}`
				: undefined,
			`https://${webDomain}/fed/channel/${channel_id}/followers`,
		],
		object: {
			id: `https://${webDomain}/fed/channel/${channel_id}/mesages/${message.id}`,
			type: "Note",
			summary: null,
			inReplyTo: undefined, // TODO
			published: message.timestamp,
			url: `https://app.spacebar.chat/channels${
				message.guild?.id ? `/${message.guild.id}` : ""
			}/${channel_id}/${message.id}`,
			attributedTo: `https://${webDomain}/fed/user/${message.author!.id}`,
			to: ["https://www.w3.org/ns/activitystreams#Public"],
			cc: [
				message.author?.id
					? `https://${webDomain}/fed/users/${message.author.id}`
					: undefined,
				`https://${webDomain}/fed/channel/${channel_id}/followers`,
			],
			sensitive: false,
			content: message.content,
		},
	});
});
