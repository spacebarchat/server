import { Request, Response, Router } from "express";
import { Channel } from "../../../../util";
import { ThreadCreateSchema } from "../../../../util/schemas/ThreadCreateSchema";
import { route } from "../../../util";

const router = Router();

router.post("/", route({ body: "ThreadCreateSchema" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const body = req.body as ThreadCreateSchema;

	const thread = await Channel.createThreadChannel(
		{
			type: body.type,
			parent_id: channel_id,
			name: body.name,
			rate_limit_per_user: body.rate_limit_per_user || 0
		},
		{
			auto_archive_duration: body.auto_archive_duration
		},
		req.user_id,
		{ skipExistsCheck: true } // we only need to check if a thread was already created for a message
	);

	res.status(201).json(thread);
});

export default router;
