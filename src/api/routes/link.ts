import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	let payload: any = req.query.s;

	res.json(JSON.parse(atob(payload.substring(payload.indexOf(".") + 1))));
});


router.put("/", route({}), async (req: Request, res: Response) => {
	let payload: string = req.body.payload;
	let payloadData = payload.split(".");

	let buildOverride = JSON.parse(atob(payloadData[1]));

	res.cookie("buildOverride", (payloadData[0] + "." + btoa(JSON.stringify({ ...buildOverride.targetBuildOverride, $meta: { expiresAt: buildOverride.expiresAt } })))).sendStatus(200);
});

export default router;
