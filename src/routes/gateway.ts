import { Config } from "@fosscord/server-util";
import { Router, Response, Request } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	const { endpoint } = Config.get().gateway;
	res.json({ url: endpoint || process.env.GATEWAY || "ws://localhost:3002" });
});

export default router;
