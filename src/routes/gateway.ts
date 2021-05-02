import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	res.send({ url: "ws://localhost:3002" });
});

export default router;
