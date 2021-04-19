import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	res.send({ url: "ws://localhost:2000" });
});

export default router;
