import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	// TODO:
	res.status(200).send({ guild_affinities: [] });
});

export default router;
