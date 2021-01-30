import { Request, Response, Router } from "express";
import { check } from "../../../../util/instanceOf";
const router: Router = Router();

router.post("/", check({ test: String, $user: String }), (req: Request, res: Response) => {
	res.send("OK");
});

export default router;
