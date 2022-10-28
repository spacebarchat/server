import { Router, Request, Response } from "express";
import { route, OauthCallbackHandlers } from "@fosscord/api";
import { FieldErrors, generateToken, User } from "@fosscord/util";
const router = Router();

router.get("/:type", route({}), async (req: Request, res: Response) => {
	const { type } = req.params;
	const handler = OauthCallbackHandlers[type];
	if (!handler) throw FieldErrors({
		type: {
			code: "BASE_TYPE_CHOICES",
			message: `Value must be one of (${Object.keys(OauthCallbackHandlers).join(", ")}).`,
		}
	});

	const { code } = req.query;
	if (!code || typeof code !== "string") throw FieldErrors({ code: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED"), } });
	const access = await handler.getAccessToken(code);

	const oauthUser = await handler.getUserDetals(access.access_token);

	let user = await User.findOne({ where: { email: oauthUser.email } });
	if (!user) {
		user = await User.register({
			email: oauthUser.email,
			username: oauthUser.username,
			req
		});

		// TODO: upload pfp, banner?
	}

	const token = await generateToken(user.id);

	return { token };
});

export default router;