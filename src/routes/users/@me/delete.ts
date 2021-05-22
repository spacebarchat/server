import { Router, Request, Response } from "express";
import { UserModel,UserDocument, toObject } from "@fosscord/server-util";
import { getPublicUser } from "../../../util/User";
import { HTTPError } from "lambert-server";
import { UserUpdateSchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { db } from "@fosscord/server-util";
import bcrypt from "bcrypt";
const router = Router();

router.post("/", async (req: Request, res: Response) => {

	const user = await UserModel.findOne(
		{ id: req.user_id },
		
	).exec();  //User object
	
	let correctpass = await bcrypt.compare(req.body.password,user!.user_data.hash) //Not sure if user typed right password :/
    if(correctpass){
	await UserModel.deleteOne({id: req.user_id}).exec() //Yeetus the feetus user deletus

	res.sendStatus(204);
	}
	else{
		res.sendStatus(204);	
	}
});

export default router;
