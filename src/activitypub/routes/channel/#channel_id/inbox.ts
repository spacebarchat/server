import { route } from "@spacebar/api";
import { Message, emitEvent } from "@spacebar/util";
import { Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();
export default router;

router.post("/", route({}), async (req, res) => {
	const body = req.body;

	if (body.type != "Create") throw new HTTPError("not implemented");

	const message = await Message.fromAP(body.object);
	await message.save();

	await emitEvent({
		event: "MESSAGE_CREATE",
		channel_id: message.channel_id,
		data: message.toJSON(),
	});

	return res.status(200);
});
