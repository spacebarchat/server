import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	if (!req.rights?.has("OPERATOR")) return res.sendStatus(403);
	//EXPERIMENTAL: have an "OPERATOR" platform permission implemented for this API route
	console.log(`[Server] Operator requested shutdown: user_id: ${req.user_id}`);

	res.sendStatus(200);
	process.kill(process.pid, "SIGTERM");
});

export default router;

//THIS API CAN ONLY BE USED BY USERS WITH THE 'OPERATOR' RIGHT (which is the value of 1) ONLY IF ANY OTHER RIGHTS ARE ADDED OR IF THE USER DOESNT HAVE PERMISSION,
//THE REQUEST WILL RETURN 403 'FORBIDDEN'
