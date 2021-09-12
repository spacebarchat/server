import { Config } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	const { endpoint } = Config.get().gateway;
	res.json({ url: endpoint || process.env.GATEWAY || "ws://localhost:3002" });
});

export default router;
