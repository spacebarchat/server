import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { User } from "@fosscord/util";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	//EXPERIMENTAL: have an "OPERATOR" platform permission implemented for this API route
	const user = await User.findOneOrFail({
		where: { id: req.user_id },
		select: ["rights"],
	});
	if ((Number(user.rights) << Number(0)) % Number(2) == Number(1)) {
		console.log("user that POSTed to the API was ALLOWED");
		console.log(user.rights);
		res.sendStatus(200);
		process.kill(process.pid, "SIGTERM");
	} else {
		console.log("operation failed");
		console.log(user.rights);
		res.sendStatus(403);
	}
});

export default router;

//THIS API CAN ONLY BE USED BY USERS WITH THE 'OPERATOR' RIGHT (which is the value of 1) ONLY IF ANY OTHER RIGHTS ARE ADDED OR IF THE USER DOESNT HAVE PERMISSION,
//THE REQUEST WILL RETURN 403 'FORBIDDEN'
