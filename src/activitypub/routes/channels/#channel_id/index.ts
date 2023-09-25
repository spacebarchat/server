import { transformChannelToGroup } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Channel } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: auth
router.get("/", route({}), async (req: Request, res: Response) => {
	const channel = await Channel.findOneOrFail({
		where: { id: req.params.channel_id },
	});

	return res.json(await transformChannelToGroup(channel));
});

export default router;
