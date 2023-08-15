import { messageFromAP } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Message, emitEvent } from "@spacebar/util";
import { Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();
export default router;

router.post("/", route({}), async (req, res) => {
	const body = req.body;

	if (body.type != "Create") throw new HTTPError("not implemented");

	const message = await messageFromAP(body.object);

	if ((await Message.count({ where: { id: message.id } })) != 0)
		return res.status(200);

	await message.save();

	await emitEvent({
		event: "MESSAGE_CREATE",
		channel_id: message.channel_id,
		data: message.toJSON(),
	});

	return res.status(200);
});
