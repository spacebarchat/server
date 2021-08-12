import { Router, Request, Response } from "express";
import { GuildModel, MemberModel, UserModel } from "@fosscord/server-util";
import bcrypt from "bcrypt";
const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }).exec(); //User object

	let correctpass = await bcrypt.compare(req.body.password, user!.user_data.hash); //Not sure if user typed right password :/
	if (correctpass) {
		await Promise.all([
			UserModel.deleteOne({ id: req.user_id }).exec(), //Yeetus user deletus
			MemberModel.deleteMany({ id: req.user_id }).exec()
		]);

		res.sendStatus(204);
	} else {
		res.sendStatus(401);
	}
});

export default router;
