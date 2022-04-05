import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { User, emitEvent } from "@fosscord/util";

const router: Router = Router();

router.get("/:id", route({}), async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["notes"] });

	const note = user.notes[id];
	return res.json({
		note: note,
		note_user_id: id,
		user_id: user.id,
	});
});

router.put("/:id", route({}), async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await User.findOneOrFail({ where: { id: req.user_id } });
	const noteUser = await User.findOneOrFail({ where: { id: id }});		//if noted user does not exist throw
	const { note } = req.body;

	await User.update({ id: req.user_id }, { notes: { ...user.notes, [noteUser.id]: note } });

	await emitEvent({
		event: "USER_NOTE_UPDATE",
		data: {
			note: note,
			id: noteUser.id
		},
		user_id: user.id,
	})

	return res.status(204);
});

export default router;
