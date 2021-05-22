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
	const { authorization } = req.headers;
 //console.log(req.headers);
	console.log(authorization);
	var auth = ""+ authorization;
	let u = JSON.parse(atob(auth.split(".")[1]))
	var userid = u.id;
	console.log(userid);
	const user = await getPublicUser(userid);
	await UserModel.remove(user).exec();
	//await usermodel.save();

	res.sendStatus(204);
});

export default router;
