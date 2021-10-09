import { Router, Request, Response } from "express";
import { User, PrivateUserProjection, emitEvent, UserUpdateEvent, handleFile, FieldErrors } from "@fosscord/util";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";

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
	accent_color?: number;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
}

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json(await User.findOne({ select: PrivateUserProjection, where: { id: req.user_id } }));
});

router.patch("/", route({ body: "UserModifySchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);
	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: [...PrivateUserProjection, "data"] });

	if (body.password) {
		if (user.data?.hash) {
			const same_password = await bcrypt.compare(body.password, user.data.hash || "");
			if (!same_password) {
				throw FieldErrors({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
			}
		} else {
			user.data.hash = await bcrypt.hash(body.password, 12);
		}
	}

	user.assign(body);

	if (body.new_password) {
		if (!body.password && !user.email) {
			throw FieldErrors({
				password: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
			});
		}
		user.data.hash = await bcrypt.hash(body.new_password, 12);
	}

	await user.save();

	// @ts-ignore
	delete user.data;

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
