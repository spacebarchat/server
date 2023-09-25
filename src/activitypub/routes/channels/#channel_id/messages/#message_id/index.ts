import { transformMessageToAnnounceNoce } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Message } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: auth
router.get("/", route({}), async (req: Request, res: Response) => {
	const { channel_id, message_id } = req.params;

	const message = await Message.findOneOrFail({
		where: { channel_id, id: message_id },
	});

	return res.json(await transformMessageToAnnounceNoce(message));
});

export default router;
