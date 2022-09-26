import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { User, Note, emitEvent, Snowflake } from "@fosscord/util";

const router: Router = Router();

router.get("/:id", route({}), async (req: Request, res: Response) => {
	const { id } = req.params;

	const note = await Note.findOneOrFail({
		where: {
			owner: { id: req.user_id },
			target: { id: id },
		},
	});

	return res.json({
		note: note?.content,
		note_user_id: id,
		user_id: req.user_id,
	});
});

router.put("/:id", route({}), async (req: Request, res: Response) => {
	const { id } = req.params;
	const owner = await User.findOneOrFail({ where: { id: req.user_id } });
	const target = await User.findOneOrFail({ where: { id: id } }); //if noted user does not exist throw
	const { note } = req.body;

	if (note && note.length) {
		// upsert a note
		if (
			await Note.findOne({
				where: { owner: { id: owner.id }, target: { id: target.id } },
			})
		) {
			Note.update(
				{ owner: { id: owner.id }, target: { id: target.id } },
				{ owner, target, content: note },
			);
		} else {
			Note.insert({
				id: Snowflake.generate(),
				owner,
				target,
				content: note,
			});
		}
	} else {
		await Note.delete({
			owner: { id: owner.id },
			target: { id: target.id },
		});
	}

	await emitEvent({
		event: "USER_NOTE_UPDATE",
		data: {
			note: note,
			id: target.id,
		},
		user_id: owner.id,
	});

	return res.status(204);
});

export default router;
