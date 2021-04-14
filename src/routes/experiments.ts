import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	// TODO:
	res.send({ fingerprint: "", assignments: [] });
});

export default router;
