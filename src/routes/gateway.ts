import { Router } from "express";
import Config from "../util/Config"

const router = Router();

router.get("/", (req, res) => {
	const { endpoint } = Config.getAll().gateway();
	res.send({ url: endpoint || "ws://localhost:3002" });
});

export default router;
