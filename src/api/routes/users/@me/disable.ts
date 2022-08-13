import { User } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";

const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] }); //User object
	let correctpass = true;

	if (user.data.hash) {
		// guest accounts can delete accounts without password
		correctpass = await bcrypt.compare(req.body.password, user.data.hash); //Not sure if user typed right password :/
	}

	if (correctpass) {
		await User.update({ id: req.user_id }, { disabled: true });

		res.sendStatus(204);
	} else {
		res.status(400).json({ message: "Password does not match", code: 50018 });
	}
});

export default router;
