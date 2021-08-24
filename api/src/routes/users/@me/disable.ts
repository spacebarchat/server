import { User } from "@fosscord/util";
import { Router, Response, Request } from "express";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ id: req.user_id }); //User object

	let correctpass = await bcrypt.compare(req.body.password, user!.data.hash); //Not sure if user typed right password :/
	if (correctpass) {
		await User.update({ id: req.user_id }, { disabled: true });

		res.sendStatus(204);
	} else {
		res.status(400).json({ message: "Password does not match", code: 50018 });
	}
});

export default router;
