import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
const router = Router();

//TODO: implement integrations list
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});
export default router;
