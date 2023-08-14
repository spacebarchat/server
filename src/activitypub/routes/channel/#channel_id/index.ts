import { route } from "@spacebar/api";
import { Channel } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/", route({}), async (req: Request, res: Response) => {
	const id = req.params.id;

	const channel = await Channel.findOneOrFail({ where: { id } });

	return res.json(channel.toAP());
});
