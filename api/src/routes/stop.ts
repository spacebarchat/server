import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { User } from "@fosscord/util";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	//TODO: have an "OPERATOR" platform permission implemented for this API route
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["flags"] });
	if(user.flags == '4096') {
		console.log("user that POSTed to the API was ALLOWED");
		console.log(user.flags);
		res.sendStatus(200)
		process.kill(process.pid, 'SIGTERM')
	}
	if(user.flags <= '4095') {
		console.log("user that POSTed to the /stop API was DENIED");
		console.log(user.flags);
		res.sendStatus(403)
	}
	if(user.flags >= '4097'){
		console.log("user that POSTed to the /stop API was DENIED");
		console.log(user.flags);
		res.sendStatus(403)
	}
});

export default router;

//THIS API CAN ONLY BE USED BY USERS WITH THE 'SYSTEM' FLAG ONLY IF ANY OTHER FLAGS ARE ADDED THE REQUEST WILL RETURN 403 'FORBIDDEN'
