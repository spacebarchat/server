import { Router, Request, Response } from "express";
import { Guild, Member, User } from "@fosscord/util";
import bcrypt from "bcrypt";
const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ id: req.user_id }); //User object

	let correctpass = await bcrypt.compare(req.body.password, user!.data.hash); //Not sure if user typed right password :/
	if (correctpass) {
		await Promise.all([
			User.deleteOne({ id: req.user_id }), //Yeetus user deletus
			Member.deleteMany({ id: req.user_id })
		]);

		res.sendStatus(204);
	} else {
		res.sendStatus(401);
	}
});

export default router;
