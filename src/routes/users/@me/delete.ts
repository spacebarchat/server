import { Router, Request, Response } from "express";
import { UserModel, toObject } from "@fosscord/server-util";
import { getPublicUser } from "../../../util/User";
import { HTTPError } from "lambert-server";
import { UserUpdateSchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { db } from "@fosscord/server-util";
const router = Router();

router.post("/", async (req: Request, res: Response) => {
	// TODO:
 //console.log(req.headers);
 await UserModel.deleteOne({id: req.user_id}).exec()
	
	//await usermodel.save();

	res.sendStatus(204);
});

export default router;
