import { route } from "@spacebar/api";
import { Message } from "@spacebar/util";
import { Router } from "express";

const router = Router();
export default router;

router.get("/:message_id", route({}), async (req, res) => {
	const id = req.params.message_id;

	const message = await Message.findOneOrFail({ where: { id } });

	return res.json(message.toAP());
});
