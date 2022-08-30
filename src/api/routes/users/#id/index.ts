import { route } from "@fosscord/api";
import { User } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { id } = req.params;

	res.json(await User.getPublicUser(id));
});

export default router;
