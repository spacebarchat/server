import { Router } from "express";
import * as Config from "../util/Config"

const router = Router();

router.get("/", (req, res) => {
	const { gateway } = Config.apiConfig.getAll();
	res.send({ url: gateway || "ws://localhost:3002" });
});

export default router;
