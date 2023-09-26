import { transformNoteToMessage } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Message, emitEvent } from "@spacebar/util";
import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

// TODO: check if the activity exists on the remote server
// TODO: support lemmy ChatMessage type?
router.post("/", route({}), async (req: Request, res: Response) => {
	const body = req.body as AP.Create;

	if (body.type != "Create") throw new HTTPError("not implemented");

	const object = Array.isArray(body.object) ? body.object[0] : body.object;
	if (!object) return res.status(400);
	if (!("type" in object) || object.type != "Note")
		throw new HTTPError("must be Note");
	const message = await transformNoteToMessage(object as AP.Note);

	if ((await Message.count({ where: { nonce: object.id!.toString() } })) != 0)
		return res.status(200);

	await message.save();

	await emitEvent({
		event: "MESSAGE_CREATE",
		channel_id: message.channel_id,
		data: message.toJSON(),
	});

	return res.status(200);
});

export default router;
