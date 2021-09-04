import { check } from "../../../../../util/instanceOf";
import { VoiceStateUpdateSchema } from "../../../../../schema";
import { Request, Response, Router } from "express";
import { updateVoiceState } from "../../../../../util/VoiceState";

const router = Router();

router.patch("/", check(VoiceStateUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as VoiceStateUpdateSchema;
	const { guild_id, user_id } = req.params;
	await updateVoiceState(body, guild_id, req.user_id, user_id)
	return res.sendStatus(204);
});

export default router;