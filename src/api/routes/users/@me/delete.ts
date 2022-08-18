import { route } from "@fosscord/api";
import { HTTPError, Member, User } from "@fosscord/util";
import { Request, Response, Router } from "express";

let bcrypt: any;
try {
	bcrypt = require("bcrypt");
} catch {
	bcrypt = require("bcryptjs");
	console.log("Warning: using bcryptjs because bcrypt is not installed! Performance will be affected.");
}

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

	(await Member.find({ where: { id: req.user_id }, relations: ["guild"] })).forEach((x) => {
		let g = x.guild;
		if (g.member_count) g.member_count--;
		g.save();
	});

	if (correctpass) {
		await Promise.all([User.delete({ id: req.user_id }), Member.delete({ id: req.user_id })]);

		res.sendStatus(204);
	} else {
		res.sendStatus(401);
	}
});

export default router;
