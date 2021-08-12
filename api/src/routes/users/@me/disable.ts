import { UserModel } from "@fosscord/server-util";
import { Router, Response, Request } from "express";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }).exec(); //User object

	let correctpass = await bcrypt.compare(req.body.password, user!.user_data.hash); //Not sure if user typed right password :/
	if (correctpass) {
		await UserModel.updateOne({ id: req.user_id }, { disabled: true }).exec();

		res.sendStatus(204);
	} else {
		res.status(400).json({ message: "Password does not match", code: 50018 });
	}
});

export default router;
