import { User } from "@fosscord/util";
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
