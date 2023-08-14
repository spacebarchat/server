import { route } from "@spacebar/api";
import { Router } from "express";

const router = Router();
export default router;

router.post("/", route({}), async (req, res) => {
	console.log(req.body);
});
