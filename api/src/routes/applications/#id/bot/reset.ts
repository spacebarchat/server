import { Request, Response, Router } from "express";
import { User, generateToken } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {

	res.send({ token: await generateToken(req.params.id)});
});

export default router;