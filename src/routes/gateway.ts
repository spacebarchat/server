import { Router } from "express";
import Config from "../util/Config"

const router = Router();

const url = Config.get().server.root_url;

router.get("/", (req, res) => {
	res.send({ url: `ws://${url}:3002` });
});

export default router;
