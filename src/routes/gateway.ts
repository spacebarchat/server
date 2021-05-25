import { Config } from "@fosscord/server-util";
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	const { endpoint } = Config.get().gateway;
	res.send({ url: endpoint || "ws://localhost:3002" });
});

export default router;
