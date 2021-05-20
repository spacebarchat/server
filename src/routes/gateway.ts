import { Router } from "express";
import * as Config from "../util/Config"

const router = Router();

router.get("/", (req, res) => {
	const generalConfig = Config.apiConfig.get('gateway', 'ws://localhost:3002') as Config.DefaultOptions;
	const { gateway } = generalConfig;
	res.send({ url: gateway || "ws://localhost:3002" });
});

export default router;
