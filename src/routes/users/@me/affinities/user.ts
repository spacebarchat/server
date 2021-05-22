import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	// TODO:
	res.status(200).send({ user_affinities: [], inverse_user_affinities: [] });
});

export default router;
