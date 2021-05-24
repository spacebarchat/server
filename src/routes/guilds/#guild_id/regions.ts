import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

router.patch("/", function (req, res) {
	res.status(400);
    res.send("Not coded yet");
});

export default router;