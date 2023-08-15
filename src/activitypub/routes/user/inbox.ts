import { route } from "@spacebar/api";
import { Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();
export default router;

router.post("/", route({}), async (req, res) => {
	const body = req.body;

	if (body.type != "Create") throw new HTTPError("not implemented");
});
