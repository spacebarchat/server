import { route } from "@fosscord/api";
import { emitEvent, Member, PrivateUserProjection, User, UserDeleteEvent, UserDeleteSchema } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/", route({ body: "UserDeleteSchema", right: "MANAGE_USERS" }), async (req: Request, res: Response) => {
	const body = req.body as UserDeleteSchema;

	let user = await User.findOneOrFail({ where: { id: req.params.user_id }, select: [...PrivateUserProjection, "data"] });
	await Promise.all([Member.delete({ id: req.params.user_id }), User.delete({ id: req.params.user_id })]);

	// TODO: respect intents as USER_DELETE has potential to cause privacy issues
	await emitEvent({
		event: "USER_DELETE",
		user_id: req.user_id,
		data: { user_id: req.params.user_id }
	} as UserDeleteEvent);

	res.sendStatus(204);
});
