import { Router, Request, Response } from "express";
import { Guild, Member, User } from "@fosscord/util";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";
import { HTTPError } from "lambert-server";

const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] }); //User object
	let correctpass = true;

	if (user.data.hash) {
		// guest accounts can delete accounts without password
		correctpass = await bcrypt.compare(req.body.password, user.data.hash);
		if (!correctpass) {
			throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
		}
	}

	// TODO: decrement guild member count

	if (correctpass) {
		await Promise.all([User.delete({ id: req.user_id }), Member.delete({ id: req.user_id })]);

		res.sendStatus(204);
	} else {
		res.sendStatus(401);
	}
});

export default router;
