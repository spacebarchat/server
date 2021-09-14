import { Router, Request, Response } from "express";
import { User, PrivateUserProjection, emitEvent, UserUpdateEvent } from "@fosscord/util";
import { route } from "@fosscord/api";
import { handleFile } from "@fosscord/api";

const router: Router = Router();

export interface UserModifySchema {
	/**
	 * @minLength 1
	 * @maxLength 100
	 */
	username?: string;
	avatar?: string | null;
	/**
	 * @maxLength 1024
	 */
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
}

router.get("/", async (req: Request, res: Response) => {
	res.json(await User.findOne({ select: PrivateUserProjection, where: { id: req.user_id } }));
});

router.patch("/", route({ body: "UserModifySchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);
	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);

	await new User({ ...body, id: req.user_id }).save();

	//Need to reload user from db due to https://github.com/typeorm/typeorm/issues/3490
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: PrivateUserProjection });
	// TODO: send update member list event in gateway
	await emitEvent({
		event: "USER_UPDATE",
		user_id: req.user_id,
		data: user
	} as UserUpdateEvent);

	res.json(user);
});

export default router;
// {"message": "Invalid two-factor code", "code": 60008}
