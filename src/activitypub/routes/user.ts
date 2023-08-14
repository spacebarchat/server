import { route } from "@spacebar/api";
import { User } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/:id", route({}), async (req: Request, res: Response) => {
	const id = req.params.name;

	const user = await User.findOneOrFail({ where: { id } });

	return res.json(user.toAP());
});
