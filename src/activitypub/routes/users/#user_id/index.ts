import { transformUserToPerson } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { User } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: auth
router.get("/", route({}), async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({
		where: { id: req.params.user_id },
	});

	return res.json(await transformUserToPerson(user));
});

export default router;
