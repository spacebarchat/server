import { Router } from "express";
import { getPermission, MemberModel, db } from "fosscord-server-util";
import { Types } from "mongoose";
const router: Router = Router();

router.get("/", async (req, res) => {
	// @ts-ignore
	const perm = await getPermission(813185668657184768n, 813189959920910336n);
	console.log(perm);
	if (perm.has("ADD_REACTIONS")) console.log("add");
	res.send("OK");
});

export default router;
