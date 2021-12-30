import { Router, Request, Response } from "express";
import { User } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

//!WARNING!: THIS IS AN ACTIVE WORK-IN-PROGRESS THIS IS JUST THE BASE OF WHAT IS TO BE IN THE FUTURE

router.post("/", route({}), async (req: Request, res: Response) => {
	//if (req.params.id === "@me") req.params.id = req.user_id;
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["rights"] });
	const userTarget = await User.findOneOrFail({ where: { id: req.params.id }, select: ["isbanned", "deleted"] });
	
	
	if((Number(user.rights) << Number(0))%Number(2)==Number(1)) {
		if(Number(userTarget.isbanned) == 1){
			res.sendStatus(400);
		}
		if(Number(userTarget.isbanned) == 0){
			User.update({ id: req.params.id }, { isbanned: 1 });
			User.update({ id: req.params.id }, { deleted: true});
			res.sendStatus(200);
		}else{
			res.sendStatus(500);
			console.log(req.params.id);
		}
	}else{
		res.sendStatus(403);
	}
})

router.delete("/", route({}), async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["rights"] });
	const userTarget = await User.findOneOrFail({ where: { id: req.params.id }, select: ["isbanned", "deleted"] });
	
	
	if((Number(user.rights) << Number(0))%Number(2)==Number(1)) {
		if(Number(userTarget.isbanned) == 0){
			res.sendStatus(400);
		}
		if(Number(userTarget.isbanned) == 1){
			User.update({ id: req.params.id }, { isbanned: 0 });
			User.update({ id: req.params.id }, { deleted: false});
			res.sendStatus(200);
		}
	}
})

export default router;
