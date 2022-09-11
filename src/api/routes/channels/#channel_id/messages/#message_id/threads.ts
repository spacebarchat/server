import { Request, Response, Router } from "express";
import { Channel, Message, MessageType, OrmUtils } from "../../../../../../util";
import { ThreadCreateSchema } from "../../../../../../util/schemas/ThreadCreateSchema";
import { route } from "../../../../../util";

const router = Router();

router.post("/", route({ body: "ThreadCreateSchema" }), async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;
	const body = req.body as ThreadCreateSchema;

	const message = await Message.findOneOrFail({
		where: {
			id: message_id,
			channel_id
		}
	});

	const thread = await Channel.createThreadChannel(
		{
			id: message_id,
			type: body.type,
			parent_id: channel_id,
			name: body.name,
			rate_limit_per_user: body.rate_limit_per_user || 0
		},
		{
			auto_archive_duration: body.auto_archive_duration
		},
		req.user_id,
		{ keepId: true }
	);

	await OrmUtils.mergeDeep(new Message(), {
		message_reference: {
			channel_id,
			guild_id: thread.guild_id,
			message_id
		},
		type: MessageType.THREAD_STARTER_MESSAGE,
		content: "",
		author_id: message.author_id,
		channel_id: thread.id,
		sticker_items: [],
		guild_id: thread.guild_id,
		attachments: [],
		embeds: [],
		reactions: []
	}).save();

	thread.message_count = (thread.message_count || 0) + 1;
	thread.total_message_sent = (thread.total_message_sent || 0) + 1;
	await thread.save();

	res.status(201).json(thread);
});

export default router;
