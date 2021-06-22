import { Router, Request, Response } from "express";
import { UserModel, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { getPublicUser } from "../../../util/User";
import { UserModifySchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { uploadFile } from "../../../util/cdn";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	res.json(await getPublicUser(req.user_id));
});

router.patch("/", check(UserModifySchema), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) {
		try {
			const mimetype = body.avatar.split(":")[1].split(";")[0];
			const buffer = Buffer.from(body.avatar.split(",")[1], "base64");

			// @ts-ignore
			const { id } = await uploadFile(`/avatars/${req.user_id}`, { buffer, mimetype, originalname: "avatar" });
			body.avatar = id;
		} catch (error) {
			throw new HTTPError("Invalid avatar");
		}
	}

	const user = await UserModel.findOneAndUpdate({ id: req.user_id }, body).exec();
	// TODO: dispatch user update event

	res.json(toObject(user));
});

export default router;
